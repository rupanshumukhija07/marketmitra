create table diseases(
  symptoms varchar(255) not null,
  patient_email varchar(255),
  foreign key(patient_email) references patients(email)
);
