create schema if not exists aphrodite;

drop table if exists aphrodite.markers;
drop table if exists aphrodite.operations;
drop table if exists aphrodite.marker_types;
drop table if exists aphrodite.users;

create table aphrodite.users
(
    user_hash         varchar(256),
    created_timestamp timestamp default now(),
    primary key (user_hash)
);

create index users_created_timestamp on aphrodite.users (created_timestamp);

create table aphrodite.marker_types
(
    marker_type_id   bigint,
    marker_type_name varchar(20),
    primary key (marker_type_id)
);

insert into aphrodite.marker_types (marker_type_id, marker_type_name)
VALUES (1, 'RED'),
       (2, 'BLUE');

create table aphrodite.operations
(
    operation_id   bigint,
    operation_name varchar(20),
    primary key (operation_id)
);

insert into aphrodite.operations (operation_id, operation_name)
VALUES (1, 'ADD'),
       (2, 'REMOVE');

create table aphrodite.markers
(
    marker_id         serial,
    created_timestamp timestamp default now(),
    user_hash         varchar(256),
    marker_date       date,
    operation_id      bigint,
    marker_type_id    bigint,
    primary key (marker_id),
    foreign key (user_hash) references aphrodite.users (user_hash),
    foreign key (operation_id) references aphrodite.operations (operation_id),
    foreign key (marker_type_id) references aphrodite.marker_types (marker_type_id)
);

create index markers_marker_date on aphrodite.markers (marker_date);
create index markers_created_timestamp on aphrodite.markers (created_timestamp);
