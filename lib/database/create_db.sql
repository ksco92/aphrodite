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

create table aphrodite.operations
(
    operation_id   bigint,
    operation_name varchar(20),
    primary key (operation_id)
);

create table aphrodite.markers
(
    marker_id         bigint,
    created_timestamp timestamp default now(),
    user_hash         varchar(256),
    marker_date       date,
    operation_id      bigint,
    marker_type_id    bigint,
    primary key (marker_id)
);

create index markers_marker_date on aphrodite.markers (marker_date);
create index markers_created_timestamp on aphrodite.markers (created_timestamp);
