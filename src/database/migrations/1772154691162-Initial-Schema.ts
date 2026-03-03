import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1772154691162 implements MigrationInterface {
  name = 'InitialSchema1772154691162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "phones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone1" text NOT NULL, "phone2" text, "whatsapp" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid NOT NULL, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "REL_b5a41150ed03b76c81de795815" UNIQUE ("branchId"), CONSTRAINT "PK_30d7fc09a458d7a4d9471bda554" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "phoneId" uuid, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "REL_4fc2dfa7df2b760d9f452f8f9d" UNIQUE ("phoneId"), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "street" character varying(255) NOT NULL, "number" character varying(50) NOT NULL, "neighborhood" character varying(255) NOT NULL, "city" character varying(150), "postalCode" character varying(10), "interphoneCode" character varying(50), "betweenStreets" character varying(255), "reference" text, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customerId" uuid, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "REL_7bd088b1c8d3506953240ebf03" UNIQUE ("customerId"), CONSTRAINT "PK_336bda7b0a0cd04241f719fc834" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying(255) NOT NULL, "phone" character varying(255) NOT NULL, "alternativePhone" character varying(255), "email" character varying(255), "notes" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, "ordersId" uuid, CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174" UNIQUE ("phone"), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "colors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" character varying(7) NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_3a62edc12d29307872ab1777ced" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "flowers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_80a68f1514c8c0f64cfaa496ec7" UNIQUE ("name"), CONSTRAINT "PK_5dcdc7d45b8dbbde569c5f3f10c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_flowers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL DEFAULT '1', "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, "flowerId" uuid NOT NULL, "colorId" uuid, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_dfd89837268d9804b9996ba977c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bread_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_484edd556789ac7397c7e719e88" UNIQUE ("name"), CONSTRAINT "PK_30aaef910a4967171729671b198" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "fillings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_0d9829c3c757676c1c71f7dd0f6" UNIQUE ("name"), CONSTRAINT "PK_4746af1800cd0c8885a08e7da94" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "flavors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_8297edd7c37e51ab4a4bd8bcbfe" UNIQUE ("name"), CONSTRAINT "PK_167d84f2986107e162f56a7ca79" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "frostings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_57b75f1848bc3282dfd872e7141" UNIQUE ("name"), CONSTRAINT "PK_7571cc54fd339bcb8fbfe2acaea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_pictures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imageUrl" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, "productId" uuid NOT NULL, CONSTRAINT "PK_6cd1270b5bc5be78d744db0be4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "isFavorite" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "categoryId" uuid NOT NULL, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "styles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_ba0954270968477dcd9cd8cef9d" UNIQUE ("name"), CONSTRAINT "PK_1f22d2e5045f508c5fce0eb6e86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price" money NOT NULL DEFAULT '0', "quantity" integer NOT NULL DEFAULT '1', "productSize" "public"."order_details_productsize_enum", "customSize" character varying(100), "hasWriting" boolean NOT NULL DEFAULT false, "writingText" character varying(255), "writingLocation" "public"."order_details_writinglocation_enum", "pipingLocation" "public"."order_details_pipinglocation_enum", "decorationNotes" text, "notes" text, "referenceImageUrl" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid NOT NULL, "orderId" uuid NOT NULL, "colorId" uuid, "breadTypeId" uuid, "fillingId" uuid, "flavorId" uuid, "frostingId" uuid, "styleId" uuid, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_278a6e0f21c9db1653e6f406801" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "common_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "street" character varying(255) NOT NULL, "number" character varying(50) NOT NULL, "neighborhood" character varying(255) NOT NULL, "city" character varying(150), "postalCode" character varying(10), "interphoneCode" character varying(50), "betweenStreets" character varying(255), "reference" text, "notes" text, "usageCount" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_a0d76cf5ae15b7354d323875612" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dbcae3b4d31224c546e18295c9" ON "common_addresses" ("street", "number", "neighborhood") `,
    );
    await queryRunner.query(
      `CREATE TABLE "order_delivery_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "street" character varying(255) NOT NULL, "number" character varying(50) NOT NULL, "neighborhood" character varying(255) NOT NULL, "city" character varying(100), "postalCode" character varying(10), "interphoneCode" character varying(50), "betweenStreets" character varying(255), "reference" text, "deliveryNotes" text, "receiverName" character varying(255), "receiverPhone" character varying(50), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "commonAddressId" uuid, "orderId" uuid, CONSTRAINT "REL_16526c174acc0441f4eee0bb54" UNIQUE ("orderId"), CONSTRAINT "PK_e09cc92cb1d8e8a863f71dfba2a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderType" "public"."orders_ordertype_enum" NOT NULL, "orderCode" character varying(50) NOT NULL, "deliveryRound" "public"."orders_deliveryround_enum", "deliveryDate" TIMESTAMP WITH TIME ZONE NOT NULL, "deliveryTime" TIME, "readyTime" TIME, "eventTime" TIME, "setupTime" TIME, "branchDepartureTime" TIME, "collectionDateTime" TIMESTAMP WITH TIME ZONE, "setupPersonName" character varying(255), "eventServices" text, "guestCount" integer, "totalAmount" money NOT NULL DEFAULT '0', "advancePayment" money NOT NULL DEFAULT '0', "remainingBalance" money NOT NULL DEFAULT '0', "paidAmount" money NOT NULL DEFAULT '0', "dessertsTotal" money NOT NULL DEFAULT '0', "setupServiceCost" money NOT NULL DEFAULT '0', "hasPhotoReference" boolean NOT NULL DEFAULT false, "ticketNumber" character varying(50), "settlementTicketNumber" character varying(50), "paymentMethod" "public"."orders_paymentmethod_enum", "transferAccount" character varying(255), "requiresInvoice" boolean NOT NULL DEFAULT false, "settlementDate" TIMESTAMP WITH TIME ZONE, "settlementTotal" money NOT NULL DEFAULT '0', "status" "public"."orders_status_enum" NOT NULL DEFAULT 'CREATED', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customerId" uuid NOT NULL, "branchId" uuid NOT NULL, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "UQ_a97c808a83af1497276bf85e5ba" UNIQUE ("orderCode"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assignedDate" TIMESTAMP WITH TIME ZONE NOT NULL, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "bakerId" uuid NOT NULL, "orderId" uuid NOT NULL, "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, CONSTRAINT "PK_519d4a549818b74ed40f72dd893" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "lastname" character varying(255) NOT NULL, "username" character varying(255) NOT NULL, "userkey" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "area" "public"."users_area_enum", "specialty" text, "phone" character varying(20), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "branchId" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders_cancellations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "canceledAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, "canceledBy" uuid NOT NULL, CONSTRAINT "PK_224f6783bbf5078463d40a51819" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "baker_branches" ("userId" uuid NOT NULL, "branchId" uuid NOT NULL, CONSTRAINT "PK_e47fd83ad16a768b68f9af98261" PRIMARY KEY ("userId", "branchId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4c968ee9ca6689272960e64a3" ON "baker_branches" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b4b7ea6eee23af9761abf15a5" ON "baker_branches" ("branchId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "phones" ADD CONSTRAINT "FK_b5a41150ed03b76c81de795815b" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "phones" ADD CONSTRAINT "FK_c3f04379175097eff95952695cc" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "phones" ADD CONSTRAINT "FK_c3b7838c592382fcccdee28f514" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" ADD CONSTRAINT "FK_4fc2dfa7df2b760d9f452f8f9d6" FOREIGN KEY ("phoneId") REFERENCES "phones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" ADD CONSTRAINT "FK_22588392f3b0b7e89180edae031" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" ADD CONSTRAINT "FK_6b68e31b0b8cd37ee27a27c9792" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_addresses" ADD CONSTRAINT "FK_7bd088b1c8d3506953240ebf030" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_addresses" ADD CONSTRAINT "FK_e49fdf2489980fc4543f44b2112" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_addresses" ADD CONSTRAINT "FK_2f672e5bcaa1ff8d83225e1e6ef" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_b8c2a7a904f1f0e525a133e46ac" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_2ba4b3cf26d82265a4e271f10ba" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_6da780c1800bb5428ba9d59e9ed" FOREIGN KEY ("ordersId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flowers" ADD CONSTRAINT "FK_705fbad9e2d51bf696464c3834c" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flowers" ADD CONSTRAINT "FK_8bf89dc263d77415f64983e15db" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_501543b8843c1b4113f527db804" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_7e69c0cb184299a859695b9c71c" FOREIGN KEY ("flowerId") REFERENCES "flowers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_1b04f5da9a5a31aef508ea920ff" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_872318d3aec30702feb4c11b82c" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" ADD CONSTRAINT "FK_c1db1bb66f3fe7bc7646dcb7fa3" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bread_types" ADD CONSTRAINT "FK_f483cc6f2781f6f15e6189c15ca" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bread_types" ADD CONSTRAINT "FK_6459990afbea4c739c916696fd4" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fillings" ADD CONSTRAINT "FK_581b00ec8c633794af1881e0342" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fillings" ADD CONSTRAINT "FK_9798212dd68b845898f894726b1" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flavors" ADD CONSTRAINT "FK_f77cb805483db47f6ba79e69ce6" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flavors" ADD CONSTRAINT "FK_d2ce0739965391d92a235a017cd" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "frostings" ADD CONSTRAINT "FK_8109448382f10f3c4f5f5af96c5" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "frostings" ADD CONSTRAINT "FK_9991695b532137d1ce36b90b6c6" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_pictures" ADD CONSTRAINT "FK_0a3caa3b2af25665c469688ca16" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_pictures" ADD CONSTRAINT "FK_70406f844fc00fd83e358094516" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_pictures" ADD CONSTRAINT "FK_e50ee8555bdfac2d6eef6f66ba9" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_fb69fc5cdf3d7351b17eb5e9068" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_b07b160162d21dfc683ba157b3b" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_f74bae41998e06cc579f081ea78" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_2e0b16181fa66c6e36cba5c89af" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "styles" ADD CONSTRAINT "FK_2fcb37957b286fc1b05e73215c9" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "styles" ADD CONSTRAINT "FK_7efd8889d85edc1966856e71d0a" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_c67ebaba3e5085b6401911acc70" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_147bc15de4304f89a93c7eee969" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_c814ee0b6fbf0576539c9236d8f" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_e847a32f74c072d4d610cb63256" FOREIGN KEY ("breadTypeId") REFERENCES "bread_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_bb1e0884cd08e1509be3a2d467a" FOREIGN KEY ("fillingId") REFERENCES "fillings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_dd5d8772d23de187f3086e74c70" FOREIGN KEY ("flavorId") REFERENCES "flavors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_900b7f1d7294eddeb1c99531308" FOREIGN KEY ("frostingId") REFERENCES "frostings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_a5776525112fd5625dddbdf92e3" FOREIGN KEY ("styleId") REFERENCES "styles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_d6e4b3ac1c0c32daad236929eee" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "FK_ca529bfe0dc1551527b3a20a253" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "common_addresses" ADD CONSTRAINT "FK_5f2a6c188a4d215cb4386a3772e" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "common_addresses" ADD CONSTRAINT "FK_c9c543bec63eb2080be97f1f204" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery_addresses" ADD CONSTRAINT "FK_61a6f6d3930140ab9c2f11aa77c" FOREIGN KEY ("commonAddressId") REFERENCES "common_addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery_addresses" ADD CONSTRAINT "FK_16526c174acc0441f4eee0bb54f" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_873d9661d948ee484150cf4c73d" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_8d17fd47a7bbf512e58209fbb38" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_6b1a67abb0da83b51c7a2fbac40" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92" FOREIGN KEY ("bakerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_be2c5ad5e40bd737781a9b6c2c4" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_fcbc95aa105f695d11a143091fd" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_assignments" ADD CONSTRAINT "FK_7a7079958276fc52cb914435860" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_246426dfd001466a1d5e47322f4" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders_cancellations" ADD CONSTRAINT "FK_6b7f173d3defeca9e6bdeaab0f9" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders_cancellations" ADD CONSTRAINT "FK_8dfae8f608f4dee283325faa3c3" FOREIGN KEY ("canceledBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "baker_branches" ADD CONSTRAINT "FK_e4c968ee9ca6689272960e64a3a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "baker_branches" ADD CONSTRAINT "FK_4b4b7ea6eee23af9761abf15a5e" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "baker_branches" DROP CONSTRAINT "FK_4b4b7ea6eee23af9761abf15a5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "baker_branches" DROP CONSTRAINT "FK_e4c968ee9ca6689272960e64a3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders_cancellations" DROP CONSTRAINT "FK_8dfae8f608f4dee283325faa3c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders_cancellations" DROP CONSTRAINT "FK_6b7f173d3defeca9e6bdeaab0f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_246426dfd001466a1d5e47322f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_7a7079958276fc52cb914435860"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_fcbc95aa105f695d11a143091fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_be2c5ad5e40bd737781a9b6c2c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_assignments" DROP CONSTRAINT "FK_6b45c4842e305f35f827e3e2c92"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_6b1a67abb0da83b51c7a2fbac40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_8d17fd47a7bbf512e58209fbb38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_873d9661d948ee484150cf4c73d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery_addresses" DROP CONSTRAINT "FK_16526c174acc0441f4eee0bb54f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery_addresses" DROP CONSTRAINT "FK_61a6f6d3930140ab9c2f11aa77c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "common_addresses" DROP CONSTRAINT "FK_c9c543bec63eb2080be97f1f204"`,
    );
    await queryRunner.query(
      `ALTER TABLE "common_addresses" DROP CONSTRAINT "FK_5f2a6c188a4d215cb4386a3772e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_ca529bfe0dc1551527b3a20a253"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_d6e4b3ac1c0c32daad236929eee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_a5776525112fd5625dddbdf92e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_900b7f1d7294eddeb1c99531308"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_dd5d8772d23de187f3086e74c70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_bb1e0884cd08e1509be3a2d467a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_e847a32f74c072d4d610cb63256"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_c814ee0b6fbf0576539c9236d8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_147bc15de4304f89a93c7eee969"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "FK_c67ebaba3e5085b6401911acc70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "styles" DROP CONSTRAINT "FK_7efd8889d85edc1966856e71d0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "styles" DROP CONSTRAINT "FK_2fcb37957b286fc1b05e73215c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_2e0b16181fa66c6e36cba5c89af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_f74bae41998e06cc579f081ea78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_b07b160162d21dfc683ba157b3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_fb69fc5cdf3d7351b17eb5e9068"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_pictures" DROP CONSTRAINT "FK_e50ee8555bdfac2d6eef6f66ba9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_pictures" DROP CONSTRAINT "FK_70406f844fc00fd83e358094516"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_pictures" DROP CONSTRAINT "FK_0a3caa3b2af25665c469688ca16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "frostings" DROP CONSTRAINT "FK_9991695b532137d1ce36b90b6c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "frostings" DROP CONSTRAINT "FK_8109448382f10f3c4f5f5af96c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flavors" DROP CONSTRAINT "FK_d2ce0739965391d92a235a017cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flavors" DROP CONSTRAINT "FK_f77cb805483db47f6ba79e69ce6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fillings" DROP CONSTRAINT "FK_9798212dd68b845898f894726b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fillings" DROP CONSTRAINT "FK_581b00ec8c633794af1881e0342"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bread_types" DROP CONSTRAINT "FK_6459990afbea4c739c916696fd4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bread_types" DROP CONSTRAINT "FK_f483cc6f2781f6f15e6189c15ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_c1db1bb66f3fe7bc7646dcb7fa3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_872318d3aec30702feb4c11b82c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_1b04f5da9a5a31aef508ea920ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_7e69c0cb184299a859695b9c71c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_flowers" DROP CONSTRAINT "FK_501543b8843c1b4113f527db804"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flowers" DROP CONSTRAINT "FK_8bf89dc263d77415f64983e15db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flowers" DROP CONSTRAINT "FK_705fbad9e2d51bf696464c3834c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_6da780c1800bb5428ba9d59e9ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_2ba4b3cf26d82265a4e271f10ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_b8c2a7a904f1f0e525a133e46ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_addresses" DROP CONSTRAINT "FK_2f672e5bcaa1ff8d83225e1e6ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_addresses" DROP CONSTRAINT "FK_e49fdf2489980fc4543f44b2112"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_addresses" DROP CONSTRAINT "FK_7bd088b1c8d3506953240ebf030"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" DROP CONSTRAINT "FK_6b68e31b0b8cd37ee27a27c9792"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" DROP CONSTRAINT "FK_22588392f3b0b7e89180edae031"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" DROP CONSTRAINT "FK_4fc2dfa7df2b760d9f452f8f9d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phones" DROP CONSTRAINT "FK_c3b7838c592382fcccdee28f514"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phones" DROP CONSTRAINT "FK_c3f04379175097eff95952695cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phones" DROP CONSTRAINT "FK_b5a41150ed03b76c81de795815b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b4b7ea6eee23af9761abf15a5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4c968ee9ca6689272960e64a3"`,
    );
    await queryRunner.query(`DROP TABLE "baker_branches"`);
    await queryRunner.query(`DROP TABLE "orders_cancellations"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "order_assignments"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "order_delivery_addresses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dbcae3b4d31224c546e18295c9"`,
    );
    await queryRunner.query(`DROP TABLE "common_addresses"`);
    await queryRunner.query(`DROP TABLE "order_details"`);
    await queryRunner.query(`DROP TABLE "styles"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "product_pictures"`);
    await queryRunner.query(`DROP TABLE "frostings"`);
    await queryRunner.query(`DROP TABLE "flavors"`);
    await queryRunner.query(`DROP TABLE "fillings"`);
    await queryRunner.query(`DROP TABLE "bread_types"`);
    await queryRunner.query(`DROP TABLE "order_flowers"`);
    await queryRunner.query(`DROP TABLE "flowers"`);
    await queryRunner.query(`DROP TABLE "colors"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "customer_addresses"`);
    await queryRunner.query(`DROP TABLE "branches"`);
    await queryRunner.query(`DROP TABLE "phones"`);
  }
}
