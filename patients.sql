create table patients(
  email VARCHAR(255) not null primary key,
  name varchar(50) not null,
  phone_no Bigint not null UNIQUE,
  city varchar(255) not null,
  state varchar(255) not null,
  travel_history bool  not null DEFAULT false
);

insert into patients(email,name,phone_no,address,travel_history) values ('rupanshu@gmail.com','varun','700017801','bhopal',true);

insert into diseases(email,symptoms) values ('rupanshu@gmail.com','fever')
