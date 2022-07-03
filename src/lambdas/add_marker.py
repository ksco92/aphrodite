import json
import os

from utils.get_conn import get_conn
from utils.get_query_results import get_query_results
from utils.valid_marker_type_id import valid_marker_type_id
from utils.valid_operation_id import valid_operation_id
from utils.valid_user_hash import valid_user_hash


def add_marker(event, _):
    try:
        mandatory_params = [
            'user_hash',
            'marker_date',
            'operation_id',
            'marker_type_id',
        ]

        body = json.loads(event['body'])

        for param in mandatory_params:
            if param not in body:
                raise ValueError(f'Parameter {param} is required in the body of this operation.')

        user_hash = body['user_hash']
        marker_date = body['marker_date']
        operation_id = body['operation_id']
        marker_type_id = body['marker_type_id']

        conn = get_conn(os.environ.get('SecretName'))

        if not valid_marker_type_id(conn, marker_type_id):
            raise ValueError('Invalid value for marker_type_id.')

        if not valid_operation_id(conn, operation_id):
            raise ValueError('Invalid value for operation_id.')

        if not valid_user_hash(conn, user_hash):
            raise ValueError('Invalid value for user_hash.')

        insert_query = f"""insert into aphrodite.markers 
        (user_hash, marker_date, operation_id, marker_type_id)
        values ('{user_hash}', '{marker_date}', {operation_id}, {marker_type_id})"""

        get_query_results(conn, insert_query)

        conn.close()

        # TODO: make this return a new updated full calendar, view doesn't exist yet
        return {
            'isBase64Encoded': False,
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Marker added.'
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
