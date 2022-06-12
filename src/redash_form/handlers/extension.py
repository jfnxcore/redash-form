
from flask import request
from flask_restful import abort
from sqlalchemy import text, create_engine
from sqlalchemy.engine import Engine
import re
import select
from redash.handlers.base import BaseResource, get_object_or_404
from redash import models
from rq.timeouts import JobTimeoutException

from redash_form.resources import add_resource
from redash.query_runner import BaseQueryRunner, InterruptException, mssql, mysql, pg
from redash.query_runner.oracle import Oracle
from redash.serializers import serialize_job
from redash.tasks.queries.execution import enqueue_query

from redash.utils import json_dumps, json_loads

SUPPORTED_DATASOURCES: list = [ "mssql", "mysql", "oracle", "pg", "sqlite" ]
ENGINE_FACTORY_MAP: dict = {
    "mssql": lambda config: "",
    "mysql": lambda config: "",
    "oracle": lambda config: "",
    "pg": lambda config: f'postgresql+psycopg2://{config.get("user")}:{config.get("password")}@{config.get("host")}:{config.get("port")}/{config.get("dbname")}',
    "sqlite": lambda config: "",
}
TYPES_MAP_MAP: dict = {
    "mssql": lambda i: mssql.types_map.get(i[1], None),
    "mysql": lambda i: mysql.types_map.get(i[1], None),
    "oracle": lambda i: Oracle.get_col_type(i[1], i[5]),
    "pg": lambda i: pg.types_map.get(i[1], None),
    "sqlite": lambda i: None,
}

def create_sql_update_statement(viz_source_id: any, source_query: str, options: dict):
    if "columnMapping" not in options:
        abort(500, message=f"Form with view id '{viz_source_id}' has no attribute 'columnMapping' defined.")
    
    fields: list = list(map(lambda c: c[0], filter(lambda c: c[1] == "field", options["columnMapping"].items())))
    ids: list = list(map(lambda c: c[0], filter(lambda c: c[1] != "field", options["columnMapping"].items())))
    
    # Remove fields selection, order by and limit section from the source query
    source_sql = re.sub(
        r"\swhere\s", " where ", re.sub(
            r"\sorder\sby\s", " order by ", re.sub(
                r"\slimit\s", " limit ", re.sub(
                        r"\sfrom\s", " from ", source_query.replace("\n", " "), flags=re.IGNORECASE
                    ).partition(" from ")[2], flags=re.IGNORECASE
                ).partition(" limit ")[0], flags=re.IGNORECASE
            ).partition(" order by ")[0], flags=re.IGNORECASE
        ).partition(" where ")

    sql:str=f"""
    update
        {source_sql[0]}
    set
        {", ".join(map(lambda col: f"{col} = :{col}", fields))}
    where
        {source_sql[2] + " and " if source_sql[2] else ""}
        {" and ".join(map(lambda col: f"{col} = :{col}", ids))}
    returning
        {", ".join(ids + fields)};
    """
    return text(sql)

def run_query(runner: BaseQueryRunner, query):
    runner_type = runner.type()
    engine: Engine = create_engine(ENGINE_FACTORY_MAP[runner_type](runner.configuration)) 
    with engine.begin() as conn:
        try:
            cursor = conn.execute(query)
            if cursor.rowcount > 0:
                columns = runner.fetch_columns(
                    [(i[0], TYPES_MAP_MAP[runner_type](i)) for i in cursor.cursor.description]
                )
                rows = [
                    dict(zip((column["name"] for column in columns), row))
                    for row in cursor.fetchall()
                ]                
                data = {"columns": columns, "rows": rows}
                error = None
                json_data = json_dumps(data)
            else:
                error = "Query completed but it returned no data."
                json_data = None
        except (select.error, OSError) as e:
            error = "Query interrupted. Please retry."
            json_data = None
        except (KeyboardInterrupt, InterruptException, JobTimeoutException):
            raise
        except Exception as e:
            error = str(e)
            json_data = None

        return json_data, error

class FormResource(BaseResource):

    def post(self, viz_source_id):
        view: models.Visualization = get_object_or_404(models.Visualization.get_by_id_and_org, viz_source_id, self.current_org)
        source_query: models.Query = view.query_rel
        latest_query_data: models.QueryResult = source_query.latest_query_data
        datasource: models.DataSource = source_query.data_source

        if datasource.query_runner.type() not in SUPPORTED_DATASOURCES:
            abort(400, message=f"Datasource '{datasource.name}' with id '{datasource.id}' is invalid: Datasource type '{datasource.query_runner.type()}' not supported")

        query = None
        try:
            form_data = request.get_json(force=True)
            query = create_sql_update_statement(viz_source_id, latest_query_data.query_text, json_loads(view.options)).bindparams(**form_data)
        except (Exception) as e:
            abort(400, message=str(e))

        if query is None:
            abort(400, message=f"Form view id '{viz_source_id}' is invalid: Unable to initialize update statement from the source query")

        try:
            data, error = run_query(datasource.query_runner, query)
        except Exception as e:
            error = str(e)
            data = None

        if error:
            abort(400, message=error)

        job = enqueue_query(
            latest_query_data.query_text, 
            datasource, 
            self.current_user.id, 
            self.current_user.is_api_user(),
            metadata={
                "Username": repr(self.current_user)
                if self.current_user.is_api_user()
                else self.current_user.email,
                "query_id": source_query.id,
            })

        return {
            **serialize_job(job),
            data: data
        }

def extension(app=None):
    add_resource(
        app, FormResource, "/api/form_resources/<viz_source_id>/form"
    )