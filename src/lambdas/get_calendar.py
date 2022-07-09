import json

from utils.get_data_with_user_hash import get_data_with_user_hash


def get_calendar(event, _):
    try:
        select_query = "select * from aphrodite.get_calendar('{}')"

        results = get_data_with_user_hash(event, select_query)

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
