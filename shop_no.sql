
    create table shops(   shop_no int not null,
         customer_email varchar(255),
        travel_history bool  not null DEFAULT false,
         foreign key(customer_email) references patients(email),
         foreign key(shop_no) references shop_register(shop_id)
          );
