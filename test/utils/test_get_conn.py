import pytest
from sqlalchemy.engine import Connection
import os
from utils.get_conn import get_conn
from utils.get_query_results import get_query_results


def test_get_conn():
    conn = get_conn(os.environ.get('SecretName'))
    assert isinstance(conn, Connection)

    results = get_query_results(conn, 'select current_date')
    assert len(results) == 1


def test_get_conn_invalid_secret_name():
    with pytest.raises(ValueError):
        get_conn(1)
