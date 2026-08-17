class Product {
  final String id;
  final String nama;
  final String penjual;
  final int harga;

  Product({
    required this.id,
    required this.nama,
    required this.penjual,
    required this.harga,
  });
}

final List<Product> dummyProducts = [
  Product(
    id: 'P001',
    nama: 'iPhone 14 Pro 128GB Second',
    penjual: 'Dimas Store',
    harga: 11500000,
  ),
  Product(
    id: 'P002',
    nama: 'Sepatu Adidas Ultraboost',
    penjual: 'Kicks Jakarta',
    harga: 1850000,
  ),
  Product(
    id: 'P003',
    nama: 'Akun Genshin Impact AR55',
    penjual: 'GameAccStore',
    harga: 1200000,
  ),
  Product(
    id: 'P004',
    nama: 'Kamera Sony A7III Body Only',
    penjual: 'Camera Pro',
    harga: 18500000,
  ),
  Product(
    id: 'P005',
    nama: 'Jasa Desain Logo Custom',
    penjual: 'Studio Kreatif',
    harga: 350000,
  ),
  Product(
    id: 'P006',
    nama: 'PS5 Controller DualSense',
    penjual: 'Gadget Hub',
    harga: 950000,
  ),
  Product(
    id: 'P007',
    nama: 'Tas Kulit Handmade',
    penjual: 'Kicks Jakarta',
    harga: 780000,
  ),
];
