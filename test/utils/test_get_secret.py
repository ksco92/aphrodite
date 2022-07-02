import boto3
import pytest

from utils.get_secret import get_secret


@pytest.fixture
def secret_name():
    return 'aphroditebeta/rds/aphroditebeta'


def test_get_secret(secret_name):
    secret = get_secret(secret_name)
    assert isinstance(secret, dict)


def test_get_secret_invalid_name():
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name='us-east-1'
    )

    with pytest.raises(client.exceptions.ClientError):
        get_secret('invalid_secret_name')
