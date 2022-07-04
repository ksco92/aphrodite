import json
import os

from utils.get_conn import get_conn
from utils.get_query_results import get_query_results
from utils.valid_user_hash import valid_user_hash


def get_user(event, __):
    try:
        if 'multiValueQueryStringParameters' not in event:
            raise ValueError('Query string user_hash is needed for this request.')

        if 'user_hash' not in event['multiValueQueryStringParameters']:
            raise ValueError('Query string user_hash is needed for this request.')

        user_hash = event['multiValueQueryStringParameters']['user_hash'][0]

        conn = get_conn(os.environ.get('SecretName'))

        if not valid_user_hash(conn, user_hash):
            raise ValueError('Invalid value for user_hash.')

        select_query = f'''
        select * from aphrodite.users where user_hash = '{user_hash}'
        '''

        results = get_query_results(conn, select_query)

        conn.close()

        return {
            'isBase64Encoded': False,
            'statusCode': 200,
            'body': json.dumps({
                'user': results
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
