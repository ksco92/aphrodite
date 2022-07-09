import os

from utils.get_conn import get_conn
from utils.get_query_results import get_query_results
from utils.valid_user_hash import valid_user_hash


def get_data_with_user_hash(event, select_query):
    if 'multiValueQueryStringParameters' not in event:
        raise ValueError('Query string user_hash is needed for this request.')

    if 'user_hash' not in event['multiValueQueryStringParameters']:
        raise ValueError('Query string user_hash is needed for this request.')

    user_hash = event['multiValueQueryStringParameters']['user_hash'][0]

    conn = get_conn(os.environ.get('SecretName'))

    if not valid_user_hash(conn, user_hash):
        raise ValueError('Invalid value for user_hash.')

    results = get_query_results(conn, select_query.format(user_hash))

    conn.close()

    return results
