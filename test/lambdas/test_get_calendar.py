import json

import pytest

from lambdas.add_marker import add_marker
from lambdas.create_user import create_user
from lambdas.get_calendar import get_calendar


@pytest.fixture
def user_hash():
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

    return user_hash


def test_get_calendar(user_hash):
    test_event = {'multiValueQueryStringParameters': {'user_hash': [user_hash]}}
    response = get_calendar(test_event, 'a')

    assert isinstance(response, dict)
    print(json.loads(response['body']))
    assert len(json.loads(response['body'])['calendar']) == 3
    assert response['statusCode'] == 200


def test_get_calendar_no_hash(user_hash):
    test_events = [
        {'multiValueQueryStringParameters': {'invalid_key_name': [user_hash]}},
        {'some_other_invalid_key': {'invalid_key_name': [user_hash]}},
    ]

    for event in test_events:
        response = get_calendar(event, 1)

        assert isinstance(response, dict)
        assert 'error' in json.loads(response['body'])
        assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
        assert response['statusCode'] == 400


def test_get_calendar_invalid_hash():
    test_event = {'multiValueQueryStringParameters': {'user_hash': ['this is a totally invalid hash']}}

    response = get_calendar(test_event, 1)

    assert isinstance(response, dict)
    assert 'error' in json.loads(response['body'])
    assert '[BAD_REQUEST]' in json.loads(response['body'])['error']
    assert response['statusCode'] == 400
