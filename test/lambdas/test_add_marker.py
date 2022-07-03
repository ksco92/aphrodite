import json
import os

import pytest

from lambdas.add_marker import add_marker
from lambdas.create_user import create_user
from utils.get_conn import get_conn
from utils.get_query_results import get_query_results


@pytest.fixture
def event():
    response = create_user('a', 'a')
    user_hash = json.loads(response['body'])['user_hash']
    return {
        'body': json.dumps({
            'marker_date': '2022-01-01',
            'user_hash': user_hash,
            'operation_id': 1,
            'marker_type_id': 1,
        })
    }


def test_add_marker(event):
    conn = get_conn(os.environ.get('SecretName'))
    markers = get_query_results(conn, 'select count(*) as markers from aphrodite.markers')[0]['markers']

    response = add_marker(event, 'a')
    assert isinstance(response, dict)
    assert response['statusCode'] == 200

    new_markers = get_query_results(conn, 'select count(*) as markers from aphrodite.markers')[0]['markers']

    assert markers + 1 == new_markers


def test_invalid_operation_id(event):
    event['body'] = json.loads(event['body'])
    event['body']['operation_id'] = '0'
    event['body'] = json.dumps(event['body'])

    response = add_marker(event, 'a')
    assert isinstance(response, dict)
    assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
    assert 'Invalid value' in json.loads(response['body'])['error']
    assert response['statusCode'] == 400


def test_invalid_marker_type_id(event):
    event['body'] = json.loads(event['body'])
    event['body']['marker_type_id'] = '0'
    event['body'] = json.dumps(event['body'])

    response = add_marker(event, 'a')
    assert isinstance(response, dict)
    assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
    assert 'Invalid value' in json.loads(response['body'])['error']
    assert response['statusCode'] == 400


def test_invalid_missing_param(event):
    event['body'] = json.loads(event['body'])
    del event['body']['marker_type_id']
    event['body'] = json.dumps(event['body'])

    response = add_marker(event, 'a')
    assert isinstance(response, dict)
    assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
    assert 'is required in the body' in json.loads(response['body'])['error']
    assert response['statusCode'] == 400


def test_invalid_user_hash(event):
    event['body'] = json.loads(event['body'])
    event['body']['user_hash'] = 'some invalid user hash'
    event['body'] = json.dumps(event['body'])

    response = add_marker(event, 'a')
    assert isinstance(response, dict)
    assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
    assert 'Invalid value' in json.loads(response['body'])['error']
    assert response['statusCode'] == 400
