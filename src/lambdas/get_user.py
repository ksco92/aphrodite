import json
import os

from utils.get_conn import get_conn
from utils.get_query_results import get_query_results


def get_user(event, __):
    try:
        if 'multiValueQueryStringParameters' not in event:
            raise ValueError('Query string user_hash is needed for this request.')

        if 'user_hash' not in event['multiValueQueryStringParameters']:
            raise ValueError('Query string user_hash is needed for this request.')

        user_hash = event['multiValueQueryStringParameters']['user_hash'][0]

        conn = get_conn(os.environ.get('SecretName'))

        select_query = f'''
        select * from aphrodite.users where user_hash = '{user_hash}'
        '''

        results = get_query_results(conn, select_query)

        conn.close()

        if len(results) == 1:
            return {
                'isBase64Encoded': False,
                'statusCode': 200,
                'body': json.dumps({
                    'user': results
                }, default=str)
            }

        elif len(results) == 0:
            return {
                'isBase64Encoded': False,
                'statusCode': 404,
                'body': json.dumps({
                    'error': '[NOT_FOUND]: User not found.'
                })
            }

        else:
            raise Exception('There seems to be more than one result for this user.')

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
