import json
import os

from utils.get_conn import get_conn
from utils.get_query_results import get_query_results
from utils.valid_user_hash import valid_user_hash


def get_calendar(event, _):
    try:
        mandatory_params = [
            'user_hash',
        ]

        body = json.loads(event['body'])

        for param in mandatory_params:
            if param not in body:
                raise ValueError(f'Parameter {param} is required in the body of this operation.')

        user_hash = body['user_hash']

        conn = get_conn(os.environ.get('SecretName'))

        if not valid_user_hash(conn, user_hash):
            raise ValueError('Invalid value for user_hash.')

        select_query = f"select * from aphrodite.get_calendar('{user_hash}')"

        results = get_query_results(conn, select_query)

        conn.close()

        return {
            'isBase64Encoded': False,
            'statusCode': 200,
            'body': json.dumps({
                'calendar': results
            }, default=str)
        }

    except ValueError as e:
        return {
            'isBase64Encoded': False,
            'statusCode': 400,
            'body': json.dumps({
                'error': f'[BAD_REQUEST]: {str(e)}'
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