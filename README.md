# Aphrodite

## What is this?

## Infrastructure

![infrastructure diagram](doc_img/infrastructure_diagram.png)

The infrastructure is pretty straight forward. The web app will be deployed to an S3 bucket as a
static website distributed via CloudFront. The site makes HTTP requests to and API Gateway endpoint,
which triggers lambda functions that interact with an Aurora serverless cluster. Admins will have
the ability to use an SSH tunnel to connect directly to the cluster. You can follow the creation of
all these resources starting from `bin/aphrodite.ts`.

## API

### Endpoints

| Endpoint                     | Stage |
|------------------------------|-------|
| api.betaaphrodite.ksco92.com | beta  |
| TBD                          | prod  |

### Operations

#### `/create_user`
* **Method:** `POST`
* **Inputs:**
  * None
* **Outputs:**

```json
{
    "user_hash": "a_new_user_hash"
}
```

#### `/get_user`
* **Method:** `GET`
* **Inputs:**
  * User hash as a query string like this:
    * `/get_user?user_hash=the_encoded_hash`
* **Outputs:**

```json
{
    "user": [
        {
            "user_hash": "the_user_hash",
            "created_timestamp": "2022-07-04 02:18:30.324661"
        }
    ]
}
```

#### `/add_marker`
* **Method:** `POST`
* **Inputs:**

```json
{
    "user_hash": "the_user_hash",
    "marker_date": "2022-01-09",
    "operation_id": "1",
    "marker_type_id": "1"
}
```

* **Outputs:**

```json
{
    "message": "Marker added."
}
```

#### `/get_calendar`
* **Method:** `GET`
* **Inputs:**
  * User hash as a query string like this:
    * `/get_calendar?user_hash=the_encoded_hash`
* **Outputs:**

```json
{
    "calendar": [
        {
            "calendar_date": "2022-01-01",
            "user": "the_user_hash",
            "has_red_marker": 1,
            "has_blue_marker": 0
        },
        {
            "calendar_date": "2022-01-02",
            "user": "the_user_hash",
            "has_red_marker": 1,
            "has_blue_marker": 0
        }
    ]
}
```

### Database

![entity relation diagram](doc_img/er_diagram.jpg)

Creation of all the DB objects is in `lib/database/create_db.sql`

### Special notes

#### Encode a user hash

User hashes use a lot of special characters, you can encode them to pass them in a URL
doing something like this:

```python
import urllib.parse
safe_string = urllib.parse.quote_plus('the_user_hash')
print(safe_string)
```



