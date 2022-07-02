import os


def am_i_lambda() -> bool:
    """
    Determines if the current code is being run in a Lambda function or not.

    :return: Whether the current code is being run in a Lambda function or not.
    """

    return os.environ.get('AWS_EXECUTION_ENV') is not None
