<img src="https://www.cloudamqp.com/img/blog/rabbitmq-beginners-updated.png" />

# [What is RabbitMQ](https://www.rabbitmq.com/) ?

**RabbitMQ** adalah salah satu platform open source message broker terpopuler selain Kafka, yang dimana RabbitMQ itu sendiri di tulis dengan bahasa pemerograman **Erlang**, RabbitMQ juga menggunakan protokol antrian seperti AMQP (advanced message query protocol) sebagai default protokolnya, RabbitMQ sendiri untuk pemerosesan queue nya menggunakan metode **First In First Out (FIFO)** yang berarti data (message) yang peratamakali masuk akan di tambahkan dan data (message) yang pertamakali masuk juga akan pertamakali keluar, oh iya RabitMQ juga menerapkan **Load Balancer** by defaut menggunakan **algorithm round robin**, contoh jika kita mempunya 2 publisher dan memiliki 1 **subsriber (A)**, maka semua data (message) akan di konsum oleh **subscriber (A)**, tetapi jika kita membuat **1 subsciber (B)** lagi, maka yang terjadi adalah **subsriber (A)** akan menghandle data (message) dari **publisher (A)** dan **subscriber (B)** akan menghandle data (message) dari **subscriber (B)**, begitu juga seterusnya.

  **Brokers** adalah seorang maintener yang bertugas untuk memelihara dan mengontrol setiap process keluar dan masuknya data (message) dari exchange, routing dan queue.

  **Nodes** adalah 1 dari banyak instance brokers yang masing - masing memiliki exchange, queue, routing dan replication didalamnya, yang dimana 1 instance nodes akan bertindak sebagai seorang **leader (master)**, untuk mengontrol menulis dan membaca data dan yang lainnya akan bertidak sebagai seorang **folower (queue mirror)**, jadi jika leadernya mati maka akan di gantikan oleh folowernya, begitu juga seterusnya.

  **Cluster** adalah kemampuan untuk memperluas 1 brokers menjadi banyak brokers.

  **Replication** adalah kemampuan untuk mengkloning (duplikasi) sebuah **queue**, yang dimana berfungsi ketika queue tersebut hilang, maka bisa mengambil data (message) tersebut dari salinan queue yang sudah di cloning (duplikasi).

  **Offset** adalah urutan unique dari sebuah **data (message)** yang di simpan di dalam sebuah queue, yang dimana urutannya dimulai dari angka 0.

  **Exchange** digunakan untuk memproses data (message) sebelum data (message) tersebut dikirimkan ke queue, data (message) akan di kirimkan ke queue berdasarkan routing keys yang telah **di ditetapkan (binding)** sebelumnya di exchange tersebut.

  - **Binding** digunakan untuk menetukan **nama alamat (routing)** mana yang akan digunakan oleh queue/exchange, untuk meneruskan sebuah data (message).

  - **Unbinding** digunakan untuk menghapus pemberian **nama alamat (routing)** mana yang akan digunakan oleh queue/exchange, untuk meneruskan sebuah data (message), tetapi jika routing yang di unbind hanya ada 1 routing keys yang diberikan di **exchange**, maka exchage yang anda miliki juga akan ikut terhapus.

  - **Routing** digunakan sebagai **nama alamat (routing)** yang menjembatani komunikasi antara exchage/queue, untuk meneruskan sebuah data (message) yang sebelumnya berada di exchange yang kemudian nanti akan di teruskan ke queue.

   - ### Table Description
   
     - **name**: adalah unique identitas dari setiap masing - masing exchange.

     - **features**: adalah untuk menunjukan konfigurasi apa saja yang diterapkan oleh exchange, contoh anda bisa menambahkan konfigurasi durable ke true yang dimana exchange akan tetap ada walapun servernya crash sekalipun.

     - **type**: adalah sebuah action bagaimana cara exchange dapat memproses sebuah data, yang akan dikirim ke sebuah queue.

   - ### Exchange Type

     - **Direct**: digunakan untuk meneruskan ke data ke satu queue berdasarkan routing keys yang telah di tentukan example -> `a.b.c`, tetapi tidak support wildcard patter seperti type topic.

     - **Fanout**: digunakan untuk meneruskan data ke semua queue yang ada tanpa menentukan routing keys, tetapi juga bisa meneruskan data dengan menggunakan routing keys, tetapi akan sama saja seperti tidak menggunakan routing keys, karena akan meneruskan data ke semua queue juga yang telah di binding di exchange.

     - **Topic**: digunakan untuk meneruskan data ke semua queue dengan menggunakan wildcard pattern * or # example -> `*.b.* or b.#` atau bisa juga tanpa  menggunakan wildcard pattern seperti type direct, tetapi hanya meneruskan data ke satu queue saja.

     - **Headers**: digunakan untuk meneruskan data ke semua queue berdasarkan routing keys yang telah di tentukan example -> `queue=a, queue, a` atau tanpa menggunakan routing keys juga bisa sama seperti type fanout.

- ### What is Queue ?

  **Queue** digunakan untuk menyimpan sebuah data (message) yang di berikan oleh exchange, yang kemudian nanti akan di teruskan ke client untuk di konsumsi atau di gunakan.

     - **Get Queue** digunakan untuk membaca data (message) dari sebuah queue, yang di kirimkan dari **publisher**.

     - **Publish Queue** digunakan untuk mengirim data (message) ke sebuah queue, yang nanti nya data tersebut dapat di konsumsi oleh **Subscriber**.

     - **Delete Queue** digunakan untuk menghapus queue saat ini.

     - **Purge Queue** digunakan untuk menghapus semua data (message) yang ada pada queue tanpa menghapus queue saat ini.
   
   - ### Table Description
   
     - **name**: adalah unique identitas dari setiap masing - masing queue.

     - **features**: adalah untuk menunjukan konfigurasi apa saja yang diterapkan oleh queue, contoh anda bisa menambahkan konfigurasi durable ke true yang dimana queue akan tetap ada walapun servernya crash sekalipun.

     - **state**: adalah untuk menunjukan sebuah status apakah queue tersebut sedang aktif atau tidak aktif, jika ada aktifitas secara terus menerus baik data masuk atau keluar maka status queue akan berubah menjadi **aktif (running)** kembali, dan jika tidak ada aktifitas yang secara terus menerus, baik data masuk atau keluar status queue akan berubah menjadi **tidak aktif (idle)** kembali, tetapi balik lagi tergantung type `queue` apa yang anda gunakan jika type nya `classic` status tidak aktif/aktif akan berlaku terkecuali untuk type queue `quorum` dan `stream` akan selalu **aktif (running)**.

     - **ready**: adalah total keseluruhan data (message) pada queue yang siap dibaca.
     - **total**: adalah total keseluruhan data (message) pada queue yang belum dibaca.
     - **unacked**: adalah total keseluruhan data (message) pada queue yang di rejected oleh server atau tidak di process oleh server.
     - **type**: adalah sebuah action bagaimana cara queue dapat memproses sebuah data (message) yang diberikan dari **publisher**
    
  - ### Queue Type

       + **classic**: digunakan sebagai tradional queue, tetapi type ini sudah tidak akan di support kembali di versi rabbitmq yang akan mendatang.
       + **quorum**: digunakan sebagai modern queue, yang dimana hampir mirip cara kerjanya dengan traditional queue, tetapi memiliki lebih banyak fiture dari traditional queue dan modern queue menggunakan **raft protocol**, fiture ini hanya tersedia di rabbitmq 3.7 keatas, ini juga bisa sebagai pilihan alternative dari classic type, dikarenakan classic type sudah tidak akan di support lagi di versi yang akan mendatang. 
       + **stream** digunakan sebagai queue streaming, yang dimana dapat memprocess sebuah data yang sangat besar dengan sangat cepat dan penggunaan memory yang lebih kecil ketimbang dari type lainnya, banyak fiture yang dimiliki oleh stream type, diantara salah satunnya adalah kemampuan untuk melakukan replication.

- # RabbitMQ Ack Model

   - **acknowledge**: sebuah data akan di check terlebih dahulu oleh server, apakah data tersebut akan disetujui oleh server untuk di process, tetapi data tersebut akan hilang dari queue setelah data tersebut di **konsumsi (subscribe)**, gunakan ini ketika anda melakukan subscribe.

   - **noacknowledge**: sebuah data tidak akan di check terlebih dahulu oleh server, yang berarti data tesebut bisa langsung di process, tetapi data tersebut akan selalu didaftarkan kembali kedalam queue, setiap kali data itu akan di **konsumsi (subscribe)**, gunakan ini ketika anda melakukan publish.
