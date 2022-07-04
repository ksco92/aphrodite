import os
from datetime import datetime

from utils.get_conn import get_conn
from utils.get_query_results import get_query_results


def test_get_query_results():
    query = f'''
    select current_date as date, 1 as num, 'abcd' as str
    union all
    select current_date as date, 2 as num, 'efgh' as str
    '''

    conn = get_conn(os.environ.get('SecretName'))
    results = get_query_results(conn, query)

    assert len(results) == 2
    assert isinstance(results, list)

    for result in results:
        isinstance(result, dict)
        isinstance(result['date'], datetime)
        isinstance(result['num'], int)
        isinstance(result['str'], str)
