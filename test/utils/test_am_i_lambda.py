import os

from utils.am_i_lambda import am_i_lambda


def test_am_i_lambda():
    assert not am_i_lambda()


def test_am_i_lambda_simulated():
    os.environ['AWS_EXECUTION_ENV'] = 'a'
    assert am_i_lambda()
    del os.environ['AWS_EXECUTION_ENV']
