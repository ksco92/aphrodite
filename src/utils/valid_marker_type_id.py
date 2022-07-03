from utils.get_query_results import get_query_results


def valid_marker_type_id(conn, marker_type_id):
    query = f'select marker_type_id from aphrodite.marker_types where marker_type_id = {marker_type_id}'

    results = get_query_results(conn, query)

    if len(results) == 1:
        return True

    else:
        return False
