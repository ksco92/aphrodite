import json
import os

from lambdas.create_user import create_user
from utils.get_conn import get_conn
from utils.get_query_results import get_query_results


def test_get_user():
    conn = get_conn(os.environ.get('SecretName'))
    created_user = create_user('a', 'a')
    user_hash = json.loads(created_user['body'])['user_hash']

    users = get_query_results(conn,
                              f"""select count(*) as users 
                              from aphrodite.users 
                              where user_hash = '{user_hash}'""")[0]['users']

    assert users == 1
