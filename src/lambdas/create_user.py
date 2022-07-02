import json
import os

from utils.generate_user_hash import generate_user_hash
from utils.get_conn import get_conn
from utils.get_query_results import get_query_results


def create_user(_, __):
    try:
        user_hash = generate_user_hash()

        conn = get_conn(os.environ.get('SecretName'))

        insert_query = f''' insert into aphrodite.users (user_hash) values ('{user_hash}') '''

        get_query_results(conn, insert_query)

        conn.close()

        return {
            'isBase64Encoded': False,
            'statusCode': 200,
            'body': json.dumps({
                'user_hash': user_hash
            })
        }

    except Exception as e:
        return {
            'isBase64Encoded': False,
            'statusCode': 500,
            'body': json.dumps({
                'error': f'[ERROR]: {str(e)}'
            })
        }
