import json

from lambdas.create_user import create_user
from utils.get_conn import get_conn
from utils.get_query_results import get_query_results


def test_create_user():
    conn = get_conn('abcd')
    users = get_query_results(conn, 'select count(*) as users from aphrodite.users')[0]['users']

    response = create_user('a', 'a')
    assert isinstance(response, dict)
    assert len(json.loads(response['body'])['user_hash']) == 256
    assert response['statusCode'] == 200

    new_users = get_query_results(conn, 'select count(*) as users from aphrodite.users')[0]['users']
    print(users)
    print(new_users)

    assert users + 1 == new_users