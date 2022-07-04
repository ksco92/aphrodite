import json

import pytest

from lambdas.add_marker import add_marker
from lambdas.create_user import create_user
from lambdas.get_calendar import get_calendar


@pytest.fixture
def event():
    response = create_user('a', 'a')
    user_hash = json.loads(response['body'])['user_hash']
    add_marker({
        'body': json.dumps({
            'marker_date': '2022-01-01',
            'user_hash': user_hash,
            'operation_id': 1,
            'marker_type_id': 1,
        })
    }, 'a')

    add_marker({
        'body': json.dumps({
            'marker_date': '2022-01-02',
            'user_hash': user_hash,
            'operation_id': 1,
            'marker_type_id': 1,
        })
    }, 'a')

    add_marker({
        'body': json.dumps({
            'marker_date': '2022-01-03',
            'user_hash': user_hash,
            'operation_id': 1,
            'marker_type_id': 1,
        })
    }, 'a')

    return {
        'body': json.dumps({
            'user_hash': user_hash,
        })
    }


def test_get_calendar(event):
    response = get_calendar(event, 'a')

    assert isinstance(response, dict)
    print(json.loads(response['body']))
    assert len(json.loads(response['body'])['calendar']) == 3
    assert response['statusCode'] == 200


def test_invalid_missing_param(event):
    event['body'] = json.loads(event['body'])
    del event['body']['user_hash']
    event['body'] = json.dumps(event['body'])

    response = get_calendar(event, 'a')
    assert isinstance(response, dict)
    assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
    assert 'is required in the body' in json.loads(response['body'])['error']
    assert response['statusCode'] == 400


def test_invalid_user_hash(event):
    event['body'] = json.loads(event['body'])
    event['body']['user_hash'] = 'some invalid user hash'
    event['body'] = json.dumps(event['body'])

    response = get_calendar(event, 'a')
    assert isinstance(response, dict)
    assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
    assert 'Invalid value' in json.loads(response['body'])['error']
    assert response['statusCode'] == 400
