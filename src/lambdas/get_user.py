import json

from utils.get_data_with_user_hash import get_data_with_user_hash


def get_user(event, __):
    try:
        select_query = '''
                select * from aphrodite.users where user_hash = '{}'
                '''

        results = get_data_with_user_hash(event, select_query)

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
