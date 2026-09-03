export const categories = [
  { name: 'Cobbler', description: 'Thoughtful repairs and leather craft', icon: 'shoe' },
  { name: 'Potter / Kumhar', description: 'Hand-shaped pieces for everyday living', icon: 'pot' },
  { name: 'Tailor', description: 'Made-to-measure clothing with care', icon: 'needle' },
  { name: 'Artisan', description: 'Objects made slowly and beautifully', icon: 'palette' },
  { name: 'Small Vendor', description: 'Local favourites and fresh finds', icon: 'store' },
]

const portraits = [
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'
]

export const entrepreneurs = [
  ['1','Rafiq Ansari','Rafiq Leather Works','Cobbler','Mumbai',4.9,350,14,'Traditional shoe repair and custom leather sandals from a third-generation workshop.',['Shoe repair','Leather sandals','Belt crafting'],true],
  ['2','Meera Kumari','Mitti & Fire Studio','Potter / Kumhar','Jaipur',4.8,500,9,'Warm, tactile pottery inspired by the colours and quiet rhythms of Rajasthan.',['Wheel pottery','Dinnerware','Planters'],true],
  ['3','Sushila Devi','Sui Dhaaga Tailoring','Tailor','Delhi',4.7,400,18,'A patient eye for fit, finish, and the details that make clothing yours.',['Alterations','Blouses','Everyday tailoring'],false],
  ['4','Arjun Rao','Kora Woodcraft','Artisan','Bengaluru',5,650,11,'Sustainable home objects shaped from reclaimed wood and a love for simple forms.',['Woodcraft','Home decor','Gift pieces'],true],
  ['5','Farah Khan','Rangrez Threads','Artisan','Hyderabad',4.9,800,8,'Hand-block printed textiles bringing old patterns into modern homes and wardrobes.',['Block printing','Textiles','Natural dyes'],true],
  ['6','Ganesh Patil','Patil Fresh Cart','Small Vendor','Pune',4.6,150,6,'Seasonal fruit, homemade pickles, and pantry staples sourced from nearby growers.',['Fresh produce','Pickles','Local groceries'],false],
  ['7','Nandini Joshi','Bela Candle Co.','Artisan','Pune',4.8,300,7,'Small-batch soy candles with familiar Indian botanicals and gentle, lasting scents.',['Candles','Gift boxes','Custom scents'],false],
  ['8','Vikram Singh','Desert Looms','Potter / Kumhar','Jaipur',4.7,450,15,'Utility pottery and woven accents made with techniques passed down through generations.',['Terracotta','Lamps','Woven accents'],true],
].map(([id,name,business,category,location,rating,price,experience,about,skills,verified],index) => ({ id,name,business,category,location,rating,price,experience,about,skills,verified,image:portraits[index],reviews:index % 2 ? 18 : 26 }))

export const products = [
  ['p1','Monsoon Blue Kulhad Set','2','Pottery',780,'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80'], ['p2','Hand-stitched Jutti','1','Leather craft',1250,'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=80'], ['p3','Block Print Table Runner','5','Textiles',950,'https://images.unsplash.com/photo-1583845112203-454c2c74a66f?auto=format&fit=crop&w=900&q=80'], ['p4','Reclaimed Wood Tray','4','Home decor',1100,'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=80'], ['p5','Mogra Soy Candle','7','Candles',420,'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80'], ['p6','Terracotta Diya Collection','8','Pottery',350,'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=900&q=80'], ['p7','Indigo Cushion Cover','5','Textiles',560,'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80'], ['p8','Everyday Leather Belt','1','Leather craft',650,'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80'], ['p9','Carved Serving Board','4','Home decor',1450,'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'], ['p10','Mango Ginger Pickle','6','Local pantry',280,'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80']
].map(([id,name,entrepreneurId,category,price,image]) => ({id,name,entrepreneurId,category,price,image}))

export const reviews = [
  { entrepreneurId:'1', name:'Kavita M.', text:'My old sandals look brand new. Thoughtful work and a lovely experience.', rating:5 },
  { entrepreneurId:'2', name:'Rahul P.', text:'Beautifully made cups, each one has a little personality.', rating:5 },
  { entrepreneurId:'4', name:'Ananya S.', text:'The tray is sturdy, elegant, and arrived beautifully wrapped.', rating:5 },
  { entrepreneurId:'5', name:'Devika R.', text:'The colours are even more beautiful in person.', rating:5 },
]
