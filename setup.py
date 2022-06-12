# -*- coding: utf-8 -*-

# Note: copied from redash-stmo extension
import os.path

from setuptools import find_packages, setup

readme = ""
here = os.path.abspath(os.path.dirname(__file__))
readme_path = os.path.join(here, "README.md")
if os.path.exists(readme_path):
    with open(readme_path, "rb") as stream:
        readme = stream.read().decode("utf8")


setup(
    long_description=readme,
    long_description_content_type="text/markdown",
    name="redash-form",
    use_scm_version={"version_scheme": "post-release", "local_scheme": "dirty-tag"},
    #setup_requires=["setuptools_scm"],
    description="Bring Data Editor Form Extensions to Redash",
    project_urls={"homepage": "https://github.com/jfnxcore/redash-form"},
    author="jfnxcore",
    license="MPL-2.0",
    classifiers=[
        "Development Status :: 1 - Planning",
        "Environment :: Web Environment :: Plotly",
        "Framework :: Redash",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Mozilla Public License 2.0 (MPL 2.0)",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Topic :: Form :: Data Editor",
    ],
    entry_points={
        "redash.extensions": [
            "handlers_formresource = redash_form.handlers.extension:extension",
        ],
        "redash.bundles": [
            "form = redash_form.form",
        ],
    },
    packages=find_packages("src"),
    package_dir={"": "src"},
    include_package_data=True,
    python_requires='>=3.5, <4',
    install_requires=[
        "pandas",
        "numpy",
        # "dockerflow>=2018.4.0",
        # "pyhive",
        # "requests",
        # "sqlparse",
    ],
    extras_require={
        # "test": [
        #     "flake8==3.5.0",
        #     "mock",
        #     "pytest",
        #     "pytest-cov",
        #     "pytest-flake8>=1.0.5",
        # ],
        # "dev": ["watchdog[watchmedo]"],
    },
)
