import React, { useState, useEffect, useMemo, useRef } from 'react';

import { Search, MapPin, Star, Heart, Grid2x2 as Grid, List, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

import Papa from 'papaparse';

import mockServices, { Service } from '../data/mockServices';

import { supabase } from '../config/supabase';

import {

  applyAdvancedFilters,

  getAllCombinationsSorted,

  convertToMonthlyPrice,

  FilterCriteria

} from '../utils/serviceFilteringLogic';

import { ServiceDetails } from './ServiceDetails';

import { UserStorage } from '../utils/userStorage';

import { TransportModal } from './TransportModal';

interface ServiceSearchProps {

  user?: any;

  onAuthRequired?: () => void;

  headerRef?: React.RefObject<HTMLDivElement>;



  criteria: FilterCriteria;

  setCriteria: React.Dispatch<React.SetStateAction<FilterCriteria>>;



  areaQuery: string;

  setAreaQuery: React.Dispatch<React.SetStateAction<string>>;



  foodQuery: string;

  setFoodQuery: React.Dispatch<React.SetStateAction<string>>;



  tiffinQuery: string;

  setTiffinQuery: React.Dispatch<React.SetStateAction<string>>;



  viewMode: 'grid' | 'list';

  setViewMode: React.Dispatch<React.SetStateAction<'grid' | 'list'>>;



  activeView: 'combined' | 'individual';

  setActiveView: React.Dispatch<React.SetStateAction<'combined' | 'individual'>>;



  sortOrder: 'priceLowToHigh' | 'priceHighToLow';

  setSortOrder: React.Dispatch<React.SetStateAction<'priceLowToHigh' | 'priceHighToLow'>>;

}



// Area image mappings

import { VAISHNO_IMAGE } from '../data/areas/vaishno_devi_circle';

import { SHANTIGRAM_IMAGE } from '../data/areas/shantigram';

import { JAGATPUR_IMAGE } from '../data/areas/jagatpur';

import { BODAKDEV_IMAGE } from '../data/areas/bodakdev';

import { MOTERA_IMAGE } from '../data/areas/motera';

import { BOPAL_IMAGE } from '../data/areas/bopal';

import { CHANDKHEDA_IMAGE } from '../data/areas/chandkheda';

import { SHELA_IMAGE } from '../data/areas/shela';

import { CHHARODI_IMAGE } from '../data/areas/chharodi';

import { SANAND_IMAGE } from '../data/areas/sanand';

import { SHILAJ_IMAGE } from '../data/areas/shilaj';

import { TRAGAD_IMAGE } from '../data/areas/tragad';

import { VASTRAPUR_IMAGE } from '../data/areas/vastrapur';

import { AMBLI_IMAGE } from '../data/areas/ambli';

import { PALDI_IMAGE } from '../data/areas/paldi';

import { SATELLITE_IMAGE } from '../data/areas/satellite';

import { GHUMA_IMAGE } from '../data/areas/ghuma';

import { ELLISBRIDGE_IMAGE } from '../data/areas/ellisbridge';

import { GOTA_IMAGE } from '../data/areas/gota';

import { NAVRANGPURA_IMAGE } from '../data/areas/navrangpura';

import { SOLA_IMAGE } from '../data/areas/sola';

import { JODHPUR_IMAGE } from '../data/areas/jodhpur';

import { MAKARBA_IMAGE } from '../data/areas/makarba';

import { VASTRAL_IMAGE } from '../data/areas/vastral';

import { NEW_MANINAGAR_IMAGE } from '../data/areas/new_maninagar';

import { MAHADEV_NAGAR_IMAGE } from '../data/areas/mahadev_nagar';

import { ODHAV_IMAGE } from '../data/areas/odhav';

import { RAMOL_IMAGE } from '../data/areas/ramol';



// Food image mappings for common food keywords

// Multiple food images for each category - add your links here

const foodImageMappings: { [key: string]: string[] } = {

  pizza: [

    'https://content.jdmagicbox.com/comp/def_content/pizza_outlets/default-pizza-outlets-3.jpg',

    // Add more pizza image links here

    'https://www.allrecipes.com/thmb/fFW1o307WSqFFYQ3-QXYVpnFj6E=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/48727-Mikes-homemade-pizza-DDMFS-beauty-4x3-BG-2974-a7a9842c14e34ca699f3b7d7143256cf.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXSH5sF5LdtmDfNxiht4k2WWrOr7Ykr5ewkQ&s',

    'https://recipesblob.oetker.in/assets/d8a4b00c292a43adbb9f96798e028f01/1272x764/pizza-pollo-arrostojpg.webp',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQugXpVRngY9P616NZ57jyx2kl-Xoq_DbC58A&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmomF1DksRYo9MLTC6zi2qx1XjX7R5PSqPYQ&s',

    'https://cdn.loveandlemons.com/wp-content/uploads/2025/02/white-pizza.jpg',

    'https://hips.hearstapps.com/hmg-prod/images/del090121artofpanpizza-001-1631547220.jpg?crop=0.668xw:1.00xh;0.0913xw,0&resize=1200:*',

    'https://images.prismic.io/eataly-us/527aa8aa-73b6-42f4-89ec-18d96fd88502_ech-quattro-mani-matt-roan-pizza-horizontal-web.jpg?auto=compress,format',

    'https://imgmediagumlet.lbb.in/media/2025/04/67ecf7bfab0f38157d4cdc5b_1743583167585.jpg'

  ],

  chicken: [

    'https://recipes.timesofindia.com/thumb/53096628.cms?imgsize=294753&width=800&height=800',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBSL5dNEelGfIuqAC7BvXxZycMoI4XWh8KvA&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmAKp5o2Y7s06s6aKQBCkPDB4p9bGvgXlCHw&s',

    'https://static.vecteezy.com/system/resources/thumbnails/015/933/661/small_2x/tandoori-chicken-is-an-indian-non-vegetarian-spicy-food-free-photo.jpg',

    'https://static.toiimg.com/thumb/msid-62710927,width-1070,height-580,resizemode-75/62710927,pt-32,y_pad-40/62710927.jpg',

    'https://media.istockphoto.com/id/1036815628/photo/cook-taking-ready-chicken-from-the-oven.jpg?s=612x612&w=0&k=20&c=EiLeypRgbBfFN9NimEm7GaKEjWaBOEeCSXtWInVXDy0=',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrGsgaAjq45IbuQVsRwxbTDazNZ3gRERjY9g&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1f3JSaRMk3XihEICcXyHboQv4alcyxxPK5A&s',

    'https://img.freepik.com/free-psd/roasted-chicken-thighs-with-roasted-cherry-tomatoes_191095-86607.jpg?semt=ais_hybrid&w=740&q=80'

    // Add more chicken image links here

  ],

  burger: [

    'https://www.shutterstock.com/image-photo/burger-tomateoes-lettuce-pickles-on-600nw-2309539129.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI2FdiY1km0OdguHDQaSZIP_iHcM397h9elw&s',

    'https://www.bigbasket.com/media/uploads/recipe/w-l/1647_1.jpg',

    'https://b.zmtcdn.com/data/pictures/chains/6/18664896/4e0c0bafb3fe233938991cf1af655e79.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV8_Q9_dhNnojwi4KjDfPCyRs3ceY0QqGD4g&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuK-VOYVGWS0wNoZwBHlAHCYrk3E1NR7nNOg&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxxDEPDlN25j8MlaczpleFLzbgqaqnwgQaXw&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbXuD6uM0dMlaQkFm97QtW4wtIebQhm_iCEA&s',



    // Add more burger image links here

  ],

  fries: [

    'https://whisperofyum.com/wp-content/uploads/2024/10/whisper-of-yum-homemade-french-fries.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLetnQTeyzm8StHzS_UpZDjW5m9M1uP4uPxg&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOx-SR5j_W3-oFysSIgllwLEe8lSGzG7TU5A&s',

    'https://www.simplyrecipes.com/thmb/MDEiuGvXNqCBBwNFHvz5vqlc0rI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Crispy-French-Fries-LEAD-01-fa6a74d4412a41348e68d17ac200dc7f.jpg',

    'https://kirbiecravings.com/wp-content/uploads/2019/09/easy-french-fries-1.jpg',

    'https://www.savoryexperiments.com/wp-content/uploads/2024/02/Cajun-Fries-19.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZhqLCRsvKX-CYLu6BN4f064rukBiH4FYOTQ&s',

    'https://www.seriouseats.com/thmb/ORAPWUIPpK1rm9cFByHagEFIPj4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20220202-shoestring-fries-vicky-wasik-14-b95af9af5f11476d87e6e6511a399f95.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAlM5JIxhwwaK0UzleeA0jrfQD6C7HCa93Vw&s',

    'https://howtofeedaloon.com/wp-content/uploads/2022/06/poutine-IG-1.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjJxxpPvBl9zHYr41r18II57CTsz4pU1H1PQ&s'

    // Add more fries image links here

  ],

  roll: [

    'https://lh4.googleusercontent.com/proxy/EG-kWc7b5gqVrXOriIpVK4ao-jNHc5WfpDzv2g0PV_yIhzAl4tAXAy_9q69f00QG-3odYcWYf2jb7keCIUv5DCp2xp16tSMiXnpn',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaUuzcZwWQ198llZiWZ_BERbIuC6z6MJ6oQQ&s',

    'https://www.cubesnjuliennes.com/wp-content/uploads/2021/01/Spring-Roll-Recipe.jpg',

    'https://recipesblob.oetker.in/assets/b777acee3b1b47299ae7f47715e926fd/1272x764/roti-roll.webp',

    'https://i.ytimg.com/vi/4vKiaay10EQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAX3Z070tzUnBhofnXzYSzCejXDoQ',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlr0ST4xI-WCWr9eH6IogXXlZpJ-KJPxJfqA&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_EQl6ami9nhmOXqKW1usTFI5RqVSAaHJIrQ&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgjVBlOKPYOcNfYK8cccuy9BLvS7Y-gK1Jhg&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFqpkAuY1KG60DIk1vH3UEfQ7DOp5ayCgSzg&s',

    'https://i.ytimg.com/vi/NfQ7p_LzpUA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDenQlVPqAu4VbSianFVxHPptlW8g',



    // Add more roll image links here

  ],

  shake: [

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCLEHanUKGeUgyUeL11JIOZxhel2wHL6VY0g&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN4S8wWC1GZJDXq1Ex4K-v7gCmH7ieNfaMhg&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJjT7cbdKqsDepmmVNRtCnxozaB00TqaUm7Q&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2VH7WVaPdeuBfJ1KlHLrZYl0vxPdGnHZKbw&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_q3ORZ12s4Ozv6W8-ElJOwTyHOsZt7v3EUg&s',

    'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/04/mango-milkshake-recipe.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnYBUoc16NBjnEP1DFoaFi6Gh_Vp9OnetkKA&s',

    'https://assets.epicurious.com/photos/54b02985766062b203446f26/1:1/w_2560%2Cc_limit/51155560_date-shake_1x1.jpg',

    'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/11/apple-milkshake-apple-shake.jpg',

    'https://allthehealthythings.com/wp-content/uploads/2024/10/Vanilla-Protein-Shake-5-scaled.jpg',

    'https://www.allrecipes.com/thmb/3JB5nGgpQciN2JcQpkYcGMUQlPo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Delicious-Healthy-Strawberry-Shake-Yoly-2000-7a3028d448b743ffaa7a378a53cf6376.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmbh66lV-fgsU2ctGFgyET17hxm0vWmA6LiQ&s'

    // Add more shake image links here

  ],

  pasta: [

    'https://img.freepik.com/free-photo/penne-pasta-tomato-sauce-with-chicken-tomatoes-wooden-table_2829-19739.jpg',

    // Add more pasta image links here

    'https://img.freepik.com/free-photo/penne-pasta-tomato-sauce-with-chicken-tomatoes-wooden-table_2829-19744.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuseICmSRDz0bNzjiDhhZjYAug1Qx0MdF_Ww&s',

    'https://www.freepik.com/premium-photo/penne-pasta-tomato-sauce-with-chicken-tomatoes-wooden-table_7252875.htm#fromView=keyword&page=1&position=12&uuid=f1099a61-3719-4836-8cb4-7f7150ae1c3f&query=Pasta',

    'https://www.freepik.com/free-ai-image/fresh-pasta-with-hearty-bolognese-parmesan-cheese-generated-by-ai_40967605.htm#fromView=keyword&page=1&position=17&uuid=f1099a61-3719-4836-8cb4-7f7150ae1c3f&query=Pasta',

    'https://www.freepik.com/premium-photo/fusilli-pasta-with-bolognese-sauces-black-iron-pan_2821729.htm#fromView=keyword&page=1&position=22&uuid=f1099a61-3719-4836-8cb4-7f7150ae1c3f&query=Pasta',

    'https://www.freepik.com/free-photo/front-view-rotini-pasta-plate-fork-dark-isolated-surface_12060457.htm#fromView=keyword&page=1&position=26&uuid=f1099a61-3719-4836-8cb4-7f7150ae1c3f&query=Pasta',

    'https://www.freepik.com/premium-photo/penne-pasta-tomato-sauce-with-meat-tomatoes-decorated-with-pea-sprouts-dark-table_7599900.htm#fromView=keyword&page=1&position=29&uuid=f1099a61-3719-4836-8cb4-7f7150ae1c3f&query=Pasta',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGj5fp8DwKOgB02Y1w-suEvsEg_E0eYYdO_A&s'

  ],

  paneer: [

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8WO9N5Dqc4qI0F-DpCgZWDUeA3wted-3GMw&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4YXoM3ZxWpIE9enBRkY8N-RZuy35I2Ajc3A&s',

    'https://www.cookwithmanali.com/wp-content/uploads/2019/08/Palak-Paneer-500x500.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz70vemAQK_bB8Z1LAeoJd19XTzijuMz8e-g&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT6PUkvg0J_GTu6E3IiW5L3N8SCSuwjnfzBg&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgoib6oQaPydhbij7L7yaf39mqlH6iUsVIdw&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROx2aMRQ5lDjBeRfHjSlRBt2v408ZO-rWLLA&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJhtmxchl8lVryRqskmS8LFkmjuoIIouH5kw&s'

    // Add more paneer image links here

  ],

  strips: [

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZcMaCXgOU152Hb5a2vcnPCmxwI-AFNtyZxg&s',

    'https://www.licious.in/blog/wp-content/uploads/2022/09/Shutterstock_11203319452.jpg',

    'https://www.thespruceeats.com/thmb/c86z_0bK4zKAU70EdvqFeHftXpE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/spicy-fried-chicken-strips-3056880-hero-01-e5bad43e0d3441749f17c1b98b5486c2.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlO5G7QQvbkb5VfPPj1nENgBjS87jjiilaKA&s',

    'https://thesaltedpepper.com/wp-content/uploads/2022/10/Ninja-Foodi-Chicken-Tenders-sq.jpg',

    'https://www.licious.in/blog/wp-content/uploads/2022/06/shutterstock_1839684667.jpg'

    // Add more strips image links here

  ],

  pepsi: [

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRejMClxN69ZmomEGbAJMcI-8CjL8Par3l3og&s',

    'https://www.shutterstock.com/image-photo/poznan-pol-aug-13-2019-600w-1481415659.jpg',

    'https://design.pepsico.com/prod/s3fs-public/2023-07/Hero.jpg',

    'https://static-www.adweek.com/wp-content/uploads/2025/04/sprite-soft-drink-3-2025.jpg?w=600&h=315&crop=1'

    // Add more pepsi image links here

  ],

  bhajipav: [

    'https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Instant-Pot-Mumbai-Pav-Bhaji-Recipe.jpg',

    'https://content.jdmagicbox.com/comp/ahmedabad/j3/079pxx79.xx79.180829133404.i3j3/catalogue/ganesh-bhajipav-and-pulav-gota-gam-ahmedabad-pav-bhaji-centres-zd2ikhh085.jpg',

    'https://b.zmtcdn.com/data/pictures/6/112976/f2c77dc7db1795c2fa187c14bf561673_o2_featured_v2.jpg?fit=around|960:500&crop=960:500;*,*',

    'https://5.imimg.com/data5/WV/CF/MY-6552690/pav-bhaji-masala-500x500.jpg',

    'https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/gnsx50vklhyvplnjx9b7',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSarhq0U7_Y8rjIjGgkMrznM3g4w0J_E6i-Qg&s',

    'https://img.freepik.com/premium-photo/cheese-pav-bhaji-recipe-is-street-food-bhajipav-recipe-with-addition-cheese_466689-86301.jpg',

    'https://content.jdmagicbox.com/comp/ahmedabad/k4/079pxx79.xx79.180118200041.b5k4/catalogue/maa-anjani-bhajipav-amraiwadi-ahmedabad-fast-food-v4o41.jpg',

    'https://content.jdmagicbox.com/comp/ahmedabad/z5/079pxx79.xx79.200207190034.q8z5/catalogue/shree-kailash-bhajipav-raipur-ahmedabad-pav-bhaji-centres-3nwhzfkylm.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAlzDMlqg8DnDoPjY6_tQ7gdKo-5CNA_xdKw&s'

    // Add more bhajipav image links here

  ],

  maggi: [

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcnHYgh3JBgmJdU8ZYSVj5PJCq8SyiyVubug&s',

    'https://www.chefkunalkapur.com/wp-content/uploads/2024/08/lemon-coriander-noodles-1300x731.jpg?v=1723945390',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU6393z7EWuTVKCpcbhgKrfXxKL9Bi1vO4EQ&s',

    'https://motionsandemotions.com/wp-content/uploads/2023/01/Untitled-design-2023-01-20T185.jpg',

    'https://i.ytimg.com/vi/T09CbMLq6Wo/maxresdefault.jpg',

    'https://www.licious.in/blog/wp-content/uploads/2020/12/Egg-Maggi.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfHoqo_FfJG9UnKLOtX6Trqxq7iHkd-h6ung&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUDUsGVGBR-qbYIiQEZBMwJt1Lro1cOMCV3A&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcUD9gPGF4s6pG1v9z4B9O1qwtz41Z4TFktg&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUd3ybGQYZGuQko9ylolfmyaM72lOR1Ne63Q&s',

    'https://peekncooksa.blob.core.windows.net/index-recipe/chilli_garlic_maggi.jpg'



    // Add more maggi image links here

  ],

  popcorn: [

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWh1QyaQlXvE_bi3UJCYX4xo9r__1WgQqgmA&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcdmOeiDvsiUDMzKIS8TkzMP_OgM6DZgOKbw&s',

    'https://m.media-amazon.com/images/I/71WCHcFxA8L._UF894,1000_QL80_.jpg',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7tRfKQkmRi1FtZoB0ekYXAJLgWcpeXbUZ9Q&s',

    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStP5cfolcILyd8ZHskkzHuMKI8F5P-aTV7KQ&s'

    // Add more popcorn image links here

  ]

};



// Function to get random image from a category

const getRandomImageFromCategory = (images: string[]): string => {

  return images[Math.floor(Math.random() * images.length)];

};



const defaultFoodImages = [

  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAD_kasqlYXaDOWO1rCq96ZJ77o2_3xYy1Tw&s',

  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsyIsecYsOE_HeJ4OeHJMOhHkbbaduCKLeSQ&s',

  'https://hips.hearstapps.com/hmg-prod/images/del029924-grilled-teriyaki-cauliflower-steaks-099-rv-hires-index-65ec5a1b5cd03.jpg?crop=0.502xw:1.00xh;0.232xw,0&resize=640:*',

  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeybvEcRbCiMabkDDeAjOKpgeZLT74gWdkzA&s',

  'https://api.pizzahut.io/v1/content/en-in/in-1/images/pizza/mexican-fiesta.cd946a57e6c57c80adb6380aaf9bb7cb.1.jpg',

  'https://www.vikhrolicucina.com/uploads/stories/1641453929_deepfriedfhickenrolldarksurface.jpg',

  'https://hips.hearstapps.com/hmg-prod/images/creamy-gochujang-white-chicken-chili1-1671199708.jpg?crop=0.668xw:1.00xh;0.167xw,0&resize=640:*',

  'https://images.immediate.co.uk/production/volatile/sites/30/2022/08/Fish-Tacos-1337495.jpg?quality=90&resize=708,643'

];

// Function to get image based on food name keywords

const getFoodImage = (dishName: string): string => {

  const name = dishName.toLowerCase();



  // Check for pizza variations first (especially from Pizza Hut)

  if (name.includes('pizza') || name.includes('- pizza') || name.includes('pizza hut')) {

    return getRandomImageFromCategory(foodImageMappings.pizza);

  }



  // Check for roll variations (prioritized over chicken)

  if (name.includes('roll') || name.includes('wrap') || name.includes('kathi')) {

    return getRandomImageFromCategory(foodImageMappings.roll);

  }



  if (name.includes('maggi')) {

    return getRandomImageFromCategory(foodImageMappings.maggi);

  }



  // Check for burger variations

  if (name.includes('burger') || name.includes('burg')) {

    return getRandomImageFromCategory(foodImageMappings.burger);

  }



  // Check for chicken variations (including common misspellings)

  if (name.includes('chicken') || name.includes('chiken') || name.includes('tikka') || name.includes('ckn')) {

    return getRandomImageFromCategory(foodImageMappings.chicken);

  }



  // Check for fries variations

  if (name.includes('fries') || name.includes('fry') || name.includes('french')) {

    return getRandomImageFromCategory(foodImageMappings.fries);

  }



  // Check for shake variations

  if (name.includes('shake') || name.includes('smoothie') || name.includes('milkshake')) {

    return getRandomImageFromCategory(foodImageMappings.shake);

  }



  // Check for pasta variations

  if (name.includes('pasta') || name.includes('penne') || name.includes('spaghetti') || name.includes('macaroni')) {

    return getRandomImageFromCategory(foodImageMappings.pasta);

  }



  // Check for paneer variations

  if (name.includes('paneer') || name.includes('cottage cheese') || name.includes('panir')) {

    return getRandomImageFromCategory(foodImageMappings.paneer);

  }



  if (name.includes('popcorn')) {

    return getRandomImageFromCategory(foodImageMappings.popcorn);

  }



  if (name.includes('strips')) {

    return getRandomImageFromCategory(foodImageMappings.strips);

  }



  if (name.includes('pepsi')) {

    return getRandomImageFromCategory(foodImageMappings.pepsi);

  }



  if (name.includes('bhajipav') || name.includes('bhaji pav')) {

    return getRandomImageFromCategory(foodImageMappings.bhajipav);

  }



  // Default fallback image for other food items



  return getRandomImageFromCategory(defaultFoodImages);

};

// Helper function to get price unit based on service type

// @ts-ignore - Will use serviceType parameter in future

const getPriceUnit = (serviceType: string) => {



  return 'per month';

};



// Generate a stable bookmark key from service properties (type + name + city)

const generateBookmarkKey = (service: Service) => {

  const normalize = (s: string = '') =>

    s

      .toLowerCase()

      .trim()

      .replace(/\s+/g, ' ')

      .replace(/[^a-z0-9 ]/g, '')

      .replace(/\s+/g, '-');



  return `${service.type}::${normalize(service.name)}::${normalize(service.city)}`;

};



// Generate a stable unique ID from service properties

const generateStableId = (type: string, name: string, city: string, additionalInfo: string = '') => {

  const normalize = (s: string = '') =>

    s

      .toLowerCase()

      .trim()

      .replace(/\s+/g, '-')

      .replace(/[^a-z0-9-]/g, '');



  const parts = [type, normalize(name), normalize(city)];

  if (additionalInfo) {

    parts.push(normalize(additionalInfo));

  }

  return parts.join('_');

};



// ServiceCombinationCard component for displaying service combinations

const ServiceCombinationCard: React.FC<{

  combination: {

    id: string;

    services: Service[];

    totalPrice: number;

    types: string[];

  };

  onViewDetails: (service: Service) => void;

  onToggleBookmark: () => void; // combination-level handler

  onToggleBookmarkService?: (service: Service) => void; // per-service handler

  isBookmarked: boolean; // combo-level boolean

  isBookmarkedForService?: (serviceId: string) => boolean; // per-service predicate

}> = ({ combination, onViewDetails, onToggleBookmark, onToggleBookmarkService, isBookmarked, isBookmarkedForService }) => {

  return (

    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4 hover:shadow-lg transition-shadow">

      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">

        <div className="flex-1">

          <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">

            Service Combination

          </h3>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">

            {combination.types.map(type => (

              <span key={type} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">

                {type.charAt(0).toUpperCase() + type.slice(1)}

              </span>

            ))}

          </div>

        </div>

        <div className="text-left sm:text-right">

          <div className="text-base sm:text-lg font-bold text-slate-900">

            ₹{combination.totalPrice.toLocaleString()}/month

          </div>

          <div className="text-xs sm:text-sm text-green-600 font-medium">

            Combined Monthly Cost

          </div>

        </div>

      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">



        {combination.services.map((service, // @ts-ignore - Will use index parameter in future implementations

          index) => (

          <div key={service.id} className="border border-slate-100 rounded-lg p-2 sm:p-3">

            <div className="flex items-center gap-2 sm:gap-3 mb-2">

              <img

                src={service.image}

                alt={service.name}

                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"

              />

              <div className="flex-1 min-w-0">

                <h4 className="font-medium text-slate-900 text-xs sm:text-sm truncate">

                  {service.name}

                </h4>

                <div className="flex items-center gap-1">

                  <Star className="w-3 h-3 text-yellow-400 fill-current" />

                  <span className="text-xs text-slate-600">{service.rating}</span>

                </div>

              </div>

            </div>



            <div className="flex items-center justify-between">

              <span className="text-xs sm:text-sm font-medium text-slate-900">

                ₹{service.price.toLocaleString()}{getPriceUnit(service.type) ? ` ${getPriceUnit(service.type)}` : ''}

              </span>

              <div className="flex gap-1">

                {(() => {

                  const perBookmarked = isBookmarkedForService ? isBookmarkedForService(service.id) : isBookmarked;

                  return (

                    <button

                      onClick={() => {

                        if (onToggleBookmarkService) {

                          onToggleBookmarkService(service);

                        } else {

                          onToggleBookmark();

                        }

                      }}

                      className={`p-1 rounded ${perBookmarked ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:bg-slate-50'}`}

                    >

                      {perBookmarked ? (

                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-red-500" />

                      ) : (

                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />

                      )}

                    </button>

                  );

                })()}

                <button

                  onClick={() => onViewDetails(service)}

                  className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"

                >

                  View

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};



// ServiceCard component for individual services

const ServiceCard: React.FC<{

  service: Service;

  isBookmarked: boolean;

  onToggleBookmark: () => void;

  onViewDetails: () => void;

  viewMode: 'grid' | 'list';

}> = ({ service, isBookmarked, onToggleBookmark, onViewDetails, viewMode }) => {

  if (viewMode === 'list') {

    return (

      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">

        <img

          src={service.image}

          alt={service.name}

          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"

        />

        <div className="flex-1 min-w-0">

          <h3 className="font-semibold text-slate-900 mb-1 truncate">{service.name}</h3>

          <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">

            <div className="flex items-center gap-1">

              <MapPin className="w-4 h-4" />

              <span>{service.city}</span>

            </div>

            <div className="flex items-center gap-1">

              <Star className="w-4 h-4 text-yellow-400 fill-current" />

              <span>{service.rating}</span>

            </div>

          </div>

          <p className="text-sm text-slate-600 truncate">{service.description}</p>

        </div>

        <div className="text-right flex-shrink-0">

          <div className="text-lg font-bold text-slate-900">

            ₹{service.price.toLocaleString()}

          </div>

          <div className="text-sm text-slate-600">{getPriceUnit(service.type)}</div>

          <div className="flex gap-2 mt-2">

            <button

              onClick={onToggleBookmark}

              className={`p-2 rounded ${isBookmarked

                ? 'text-red-500 hover:bg-red-50'

                : 'text-slate-400 hover:bg-slate-50'

                }`}

            >

              <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />

            </button>

            <button

              onClick={onViewDetails}

              className="px-3 py-1 bg-slate-900 text-white text-sm rounded hover:bg-slate-800 transition-colors"

            >

              View Details

            </button>

          </div>

        </div>

      </div>

    );

  }



  // Source tag logic

  let sourceTag = 'General';

  if (service.type === 'accommodation') sourceTag = 'Housing.com';

  else if (service.type === 'food') {

    // Check if it's Gujarat food data or Swiggy data

    if (service.meta && service.meta['platform']) {

      sourceTag = service.meta['platform']; // Swiggy, Zomato, UberEats

    } else {

      sourceTag = 'Swiggy'; // Default for old Swiggy data

    }

  }

  else if (service.type === 'tiffin') sourceTag = 'General';



  return (

    <div

      className="bg-white rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"

      onClick={(e) => {

        // Prevent opening details if bookmark button is clicked

        if ((e.target as HTMLElement).closest('button[data-bookmark]')) return;

        onViewDetails();

      }}

      tabIndex={0}

      role="button"

      aria-label={`View details for ${service.name}`}

      style={{ minHeight: '320px' }}

    >

      <div className="relative z-0">

        {/* Source tag badge */}

        <span className="absolute top-3 left-3 z-0 bg-slate-200 text-slate-900 text-xs font-semibold px-2 py-1 rounded shadow-md">

          {sourceTag}

        </span>

        <img

          src={service.image}

          alt={service.name}

          className="w-full h-40 sm:h-48 object-cover"

        />

        <button

          onClick={(e) => {

            e.stopPropagation();

            onToggleBookmark();

          }}

          data-bookmark

          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm ${isBookmarked

            ? 'bg-red-500/20 text-red-500'

            : 'bg-white/20 text-white hover:bg-white/30'

            }`}

        >

          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />

        </button>

      </div>



      <div className="flex-1 flex flex-col p-3 sm:p-4">

        <div className="flex items-start justify-between gap-2 mb-2">

          <h3 className="font-semibold text-slate-900 text-sm sm:text-base lg:text-lg line-clamp-2">{service.name}</h3>

          <div className="flex items-center gap-1 flex-shrink-0">

            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />

            <span className="text-xs sm:text-sm text-slate-600">{service.rating.toFixed(1)}</span>

          </div>

        </div>



        <div className="flex items-center gap-1 text-slate-600 mb-2">

          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />

          <span className="text-xs sm:text-sm">{service.city}</span>

        </div>



        <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-2">{service.description}</p>



        <div className="mt-auto flex items-center justify-between gap-2">

          <div>

            <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">

              ₹{service.price.toLocaleString()}

            </div>

            <div className="text-xs sm:text-sm text-slate-600">{getPriceUnit(service.type)}</div>

          </div>

          <button

            onClick={(e) => {

              e.stopPropagation();

              onViewDetails();

            }}

            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"

          >

            View Details

          </button>

        </div>

      </div>

    </div>

  );

};



const ServiceSearch: React.FC<ServiceSearchProps> = ({

  user,

  onAuthRequired,

  criteria,

  setCriteria,

  areaQuery,

  setAreaQuery,

  foodQuery,

  setFoodQuery,

  tiffinQuery,

  setTiffinQuery,

  viewMode,

  headerRef: externalHeaderRef,

  setViewMode,

  activeView,

  setActiveView,

  sortOrder,

  setSortOrder

}) => {



  // Pagination state for individual services

  const [individualPage, setIndividualPage] = useState(1);

  const INDIVIDUALS_PER_PAGE = 20;

  // Pagination state for combined services

  const [combinationPage, setCombinationPage] = useState(1);

  const COMBINATIONS_PER_PAGE = 20;

  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const [csvServices, setCsvServices] = useState<Service[]>([]);

  const [dbServices, setDbServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(false);

  // UI-only states

  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);

  const [showTiffinSuggestions, setShowTiffinSuggestions] = useState(false);

  const [serviceTypeDropdownOpen, setServiceTypeDropdownOpen] = useState(false);

  const [showTransportModal, setShowTransportModal] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const [showStickyBar, setShowStickyBar] = useState(false);



  // Ref for the main filter section to detect when it's out of view

  const mainFilterRef = useRef<HTMLDivElement>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Use headerRef supplied via props (falls back to internal ref if not provided)

  const internalHeaderRef = useRef<HTMLDivElement>(null);

  const headerRef = externalHeaderRef || internalHeaderRef;

  const [stickyTop, setStickyTop] = useState<number>(64);

  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState<number>(64);

  const STICKY_BAR_HEIGHT = 44; // px, used to position the filters panel directly below the sticky bar

  const [filtersTop, setFiltersTop] = useState<number | null>(null);

  const [filtersOpenedFrom, setFiltersOpenedFrom] = useState<'main' | 'sticky' | null>(null);

  // Load services from database
  useEffect(() => {
    const loadServicesFromDB = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*');
        
        if (error) {
          console.error('Error loading services:', error);
          return;
        }
        
        if (data) {
          // Transform database services to match Service interface
          const transformedServices: Service[] = data.map(service => ({
            id: service.id,
            name: service.name || '',
            type: service.type || 'accommodation',
            city: service.city || '',
            price: service.price || 0,
            rating: service.rating || 0,
            description: service.description || '',
            image: service.image || '/api/placeholder/400/300',
            features: service.amenities ? [service.amenities] : [],
            meta: {
              area: service.area || '',
              address: service.address || '',
              contact: service.contact || '',
              email: service.email || '',
              website: service.website || ''
            }
          }));
          
          setDbServices(transformedServices);
          console.log('Loaded services from database:', transformedServices.length);
        }
      } catch (error) {
        console.error('Failed to load services from database:', error);
      }
    };
    
    loadServicesFromDB();
  }, []);


  // Backward-compatible setters used throughout the component  const setSearchQuery = (v: string) => setCriteria(prev => ({ ...prev, searchQuery: v }));

  const setSelectedCity = (v: string) => setCriteria(prev => ({ ...prev, selectedCity: v }));

  const setSelectedTypes = (v: string[]) => setCriteria(prev => ({ ...prev, selectedTypes: v }));

  const setPriceRange = (v: [number, number]) => setCriteria(prev => ({ ...prev, priceRange: v }));

  const setMinRating = (v: number) => setCriteria(prev => ({ ...prev, minRating: v }));



  // Backward-compatible local variables used by existing JSX

  const selectedTypes = criteria.selectedTypes || [];

  const priceRange = criteria.priceRange as [number, number];

  const minRating = criteria.minRating ?? 0;

  const selectedCity = criteria.selectedCity || '';



  



  // Food type suggestions

  const foodSuggestions = [

    'Gujarati Thali', 'South Indian', 'North Indian', 'Chinese', 'Pizza', 'Burger',

    'Tiffin Service', 'Home Cooked', 'Vegan', 'Jain Food', 'Continental', 'Fast Food'

  ];





// Utility to title-case a string (for city normalization)

const toTitleCase = (str: string) => {

    if (!str) return '';

    return str.toLowerCase().trim().split(' ').map(

        (word) => word.charAt(0).toUpperCase() + word.slice(1)

    ).join(' ');

};



  // Bookmarks handling consolidated below (runs after services are loaded)



  // Load CSV data

  useEffect(() => {

    const loadCsvData = async () => {

      setLoading(true);

      try {

        // 👇 List all accommodation CSV files

        const accommodationFiles = [

          '/data/Accomodation/Ahmedabad-with-images.csv',

          '/data/Accomodation/Surat.csv',

          '/data/Accomodation/Rajkot.csv',

          '/data/Accomodation/Baroda.csv',

          '/data/Accomodation/Gandhinagar.csv',

        ];



        // 👇 Fetch all accommodation + food CSVs together

        const [accommodationResponses, tiffinRes, swiggyRes, gujaratFoodRes] = await Promise.all([

          Promise.all(accommodationFiles.map(file => fetch(file))),

          fetch('/data/Food/tifin_rental.csv'),

          fetch('/data/Food/swiggy_Ahm.csv'),

          fetch('/data/Food/gujrat_food.csv'),

        ]);



        // 👇 Convert all accommodation CSVs to text and merge

        const accommodationTexts = await Promise.all(accommodationResponses.map(res => res.text()));

        const combinedAccommodation = accommodationTexts.join('\n');



        // 👇 Convert remaining CSVs to text

        const [tiffinText, swiggyText, gujaratFoodText] = await Promise.all([

          tiffinRes.text(),

          swiggyRes.text(),

          gujaratFoodRes.text(),

        ]);



        const services: Service[] = [];

        const seenServices = new Set<string>();



        // 👇 Parse combined accommodation data

        Papa.parse(combinedAccommodation, {

          header: true,

          complete: (results: any) => {

            results.data.forEach((row: any) => {

              if (!row.City || !row['Rent Price']) return;



              // Normalize city names

              let city = toTitleCase(row.City);

              if (city === 'Vadodara') city = 'Baroda'; // Standardize



              const serviceKey = `accommodation-${city}-${row['Locality / Area']}-${row['Rent Price']}-${row['Property Type']}`;

              if (seenServices.has(serviceKey)) return;

              seenServices.add(serviceKey);



              const locality = (row['Locality / Area'] || '').toLowerCase().trim();

              const propertyName = `${row['Property Type']} - ${row['Locality / Area']}`;



              const areaImageMap: Record<string, string> = {

                'vaishno devi circle': VAISHNO_IMAGE,

                'shantigram': SHANTIGRAM_IMAGE,

                'jagatpur': JAGATPUR_IMAGE,

                'bodakdev': BODAKDEV_IMAGE,

                'motera': MOTERA_IMAGE,

                'bopal': BOPAL_IMAGE,

                'chandkheda': CHANDKHEDA_IMAGE,

                'shela': SHELA_IMAGE,

                'chharodi': CHHARODI_IMAGE,

                'sanand': SANAND_IMAGE,

                'shilaj': SHILAJ_IMAGE,

                'tragad': TRAGAD_IMAGE,

                'vastrapur': VASTRAPUR_IMAGE,

                'ambli': AMBLI_IMAGE,

                'paldi': PALDI_IMAGE,

                'satellite': SATELLITE_IMAGE,

                'ghuma': GHUMA_IMAGE,

                'ellisbridge': ELLISBRIDGE_IMAGE,

                'gota': GOTA_IMAGE,

                'navrangpura': NAVRANGPURA_IMAGE,

                'sola': SOLA_IMAGE,

                'jodhpur': JODHPUR_IMAGE,

                'makarba': MAKARBA_IMAGE,

                'vastral': VASTRAL_IMAGE,

                'new maninagar': NEW_MANINAGAR_IMAGE,

                'mahadev nagar': MAHADEV_NAGAR_IMAGE,

                'odhav': ODHAV_IMAGE,

                'ramol': RAMOL_IMAGE,

              };



              const service: Service = {

                id: generateStableId('accommodation', propertyName, city, row['Bedrooms'] || ''),

                name: propertyName,

                type: 'accommodation',

                city, // Already standardized

                price: Number(row['Rent Price']) || 0,

                rating: Math.round((4.2 + Math.random() * 0.6) * 2) / 2,

                description: `${row['Bedrooms']} ${row['Property Type']} in ${row['Locality / Area']}, ${row['Furnishing Status']}`,

                image:

                  row.image ||

                  areaImageMap[locality] ||

                  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',

                features: (row['Amenities'] || '')

                  .split(',')

                  .map((f: string) => f.trim())

                  .filter(Boolean),

                meta: row,

              };

              services.push(service);

            });

          },

        });



        // 👇 Parse tiffin data

        Papa.parse(tiffinText, {

          header: true,

          complete: (results: any) => {

            results.data.forEach((row: any) => {

              if (!row.Name) return;



              let city = toTitleCase(row.City || 'Ahmedabad');

              if (city === 'Vadodara') city = 'Baroda'; // Standardize



              const serviceKey = `tiffin-${row.Name}-${city}-${row.Address || ''}`;

              if (seenServices.has(serviceKey)) return;

              seenServices.add(serviceKey);



              const priceRange = row['Estimated_Price_Per_Tiffin_INR'] || '₹70 - ₹120';

              const avgPrice = priceRange.includes('-')

                ? (parseInt(priceRange.split('-')[0].replace(/[^\d]/g, '')) +

                  parseInt(priceRange.split('-')[1].replace(/[^\d]/g, ''))) / 2

                : parseInt(priceRange.replace(/[^\d]/g, '')) || 95 * 30;



              const service: Service = {

                id: generateStableId('tiffin', row.Name, city, row.Address || ''),

                name: row.Name,

                type: 'tiffin',

                city: city, // Already standardized

                price: avgPrice * 30,

                rating: Math.round((Number(row.Rating) || 4.5) * 2) / 2,

                description: row.Address || 'Tiffin service provider',

                image:

                  row.Menu ||

                  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',

                features: [row.Type || 'Tiffin Service', row.Hours || 'Daily Service'].filter(Boolean),

                meta: row,

              };

              services.push(service);

            });

          },

        });



        // 👇 Parse Swiggy food data

        Papa.parse(swiggyText, {

          header: true,

          complete: (results: any) => {

            const allData = results.data || [];

            const categoryGroups: Record<string, any[]> = {};



            allData.forEach((item: any) => {

              const category = item['Category'] || 'Other';

              if (!categoryGroups[category]) categoryGroups[category] = [];

              categoryGroups[category].push(item);

            });



            const categories = Object.keys(categoryGroups);

            const totalDesired = 500;

            const sampledData: any[] = [];

            const itemsPerCategory = Math.floor(totalDesired / categories.length);

            const remainder = totalDesired % categories.length;



            categories.forEach((category, index) => {

              const categoryItems = categoryGroups[category];

              const itemsToTake = itemsPerCategory + (index < remainder ? 1 : 0);

              const taken = categoryItems.slice(0, Math.min(itemsToTake, categoryItems.length));

              sampledData.push(...taken);

            });



            sampledData.forEach((row: any) => {

              if (!row['Dish Name']) return;



              let city = toTitleCase(row['City'] || 'Ahmedabad');

              if (city === 'Vadodara') city = 'Baroda'; // Standardize



              const serviceKey = `food-${row['Dish Name']}-${row['Restaurant Name']}-${row['Location']}`;

              if (seenServices.has(serviceKey)) return;

              seenServices.add(serviceKey);



              const price = Number(row['Price (INR)']) || 0;

              const rating = Number(row['Rating']) || 0;

              const ratingCount = Number(row['Rating Count']) || 0;

              const dishName = row['Dish Name'] || 'Unknown Dish';

              const fullName = `${dishName} - ${row['Restaurant Name']}`;



              const service: Service = {

                id: generateStableId('food', fullName, city, row['Location'] || ''),

                name: fullName,

                type: 'food',

                city: city, // Already standardized

                price: price * 15,

                rating: Math.round((rating > 0 ? rating : 4.2 + Math.random() * 0.6) * 2) / 2,

                description: `${row['Category']} dish from ${row['Restaurant Name']} in ${row['Location']}. ${ratingCount > 0 ? `Based on ${ratingCount} ratings.` : ''

                  } (₹${price}/item, ~15 orders/month)`,

                image: getFoodImage(dishName),

                features: [row['Restaurant Name'], row['Location'], row['Category']].filter(Boolean),

                meta: row,

              };

              services.push(service);

            });

          },

        });



        // 👇 Parse Gujarat food data

        Papa.parse(gujaratFoodText, {

          header: true,

          complete: (results: any) => {

            results.data.forEach((row: any) => {

              if (!row['item_name'] || !row['restaurant_name']) return;



              let city = toTitleCase(row['city'] || 'Ahmedabad');

              if (city === 'Anand') return;

              if (city === 'Vadodara') city = 'Baroda'; // Standardize



              const serviceKey = `gujaratfood-${row['item_name']}-${row['restaurant_name']}-${row['city']}`;

              if (seenServices.has(serviceKey)) return;

              seenServices.add(serviceKey);



              const price = Number(row['price']) || 0;

              const rating = Number(row['rating']) || 0;

              const itemName = row['item_name'] || 'Unknown Dish';

              

              const fullName = `${itemName} - ${row['restaurant_name']}`;

              const service: Service = {

                id: generateStableId('food', fullName, city, row['platform'] || ''),

                name: fullName,

                type: 'food',

                city: city, // Already standardized

                price: price * 15,

                rating: rating > 0 ? rating : 4.2 + Math.random() * 0.6,

                description: `${row['primary_cuisine']} dish from ${row['restaurant_name']} in ${city}. Available on ${row['platform']

                  }. (₹${price}/item, ~15 orders/month)`,

                image: getFoodImage(itemName),

                features: [row['restaurant_name'], city, row['primary_cuisine'], row['platform']].filter(Boolean),

                meta: row,

              };

              services.push(service);

            });

          },

        });



        setCsvServices(services);

      } catch (error) {

        console.error('Failed to load CSV data:', error);

      } finally {

        setLoading(false);

      }

    };



    loadCsvData();

  }, []);







  // Combine and filter services - Remove duplicates by ID and standardize city names

  const allServices = useMemo(() => {
    const combined = [...mockServices, ...csvServices, ...dbServices];
    const seen = new Set<string>();
    const uniqueServices = combined.filter(service => {
      if (seen.has(service.id)) {
        return false;
      }
      seen.add(service.id);

      let city = service.city.toLowerCase().trim();
      if (city === 'anand') {
        return false;
      }
      if (city === 'vadodara') {
        service.city = 'Baroda';
      } else {
        service.city = toTitleCase(service.city);
      }
      return true;
    });
    console.log('Processed allServices:', uniqueServices.length);
    return uniqueServices;
  }, [mockServices, csvServices, dbServices]);

  const areaSuggestions = useMemo(() => {
    if (!selectedTypes.includes('accommodation')) return [];

    const relevantServices = selectedCity
      ? allServices.filter(s => s.type === 'accommodation' && s.city === selectedCity)
      : allServices.filter(s => s.type === 'accommodation');

    const areas = new Set<string>();
    relevantServices.forEach(s => {
      const areaName = s.meta?.['Locality / Area'] || s.meta?.['Area'];
      if (areaName && typeof areaName === 'string') {
        areas.add(toTitleCase(areaName));
      }
    });
    return Array.from(areas).sort();
  }, [allServices, selectedCity, selectedTypes]);



  // Load bookmarks and reconcile with current services (runs after allServices is available)

  useEffect(() => {

    const loadBookmarks = async () => {

      try {

        const resolved = new Set<string>();

        if (user) {

          // Load from database (ids) and items map

          const ids = await UserStorage.getWishlistFromDB();

          const itemsMap = await UserStorage.getWishlistItemsFromDB();

          console.log('ServiceSearch: Loaded bookmarks from DB ids:', ids);



          // Start with direct DB ids

          ids.forEach(id => resolved.add(id));



          // Try to reconcile any DB stored service_data or cached_bookmarks to current services

          const cached = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);



          // Use itemsMap first

          Object.keys(itemsMap || {}).forEach(dbId => {

            const sd = itemsMap[dbId] || {};

            // If direct match exists, keep it; otherwise try to find via stable key or type/name/city

            const direct = allServices.find(s => s.id === dbId);

            if (direct) return resolved.add(direct.id);



            if (sd.__bookmark_key) {

              const match = allServices.find(s => generateBookmarkKey(s) === sd.__bookmark_key);

              if (match) return resolved.add(match.id);

            }



            if (sd.name && sd.type) {

              const match = allServices.find(s => s.type === (sd.type || '') && s.name === (sd.name || '') && s.city === (sd.city || ''));

              if (match) return resolved.add(match.id);

            }

          });



          // Also reconcile cached_bookmarks (older local cache) similarly

          (cached || []).forEach(cb => {

            const match = allServices.find(s => s.type === (cb.type || '') && s.name === (cb.name || '') && s.city === (cb.city || ''));

            if (match) resolved.add(match.id);

          });



          setBookmarkedIds(prev => new Set([...Array.from(prev), ...Array.from(resolved)]));

        } else {

          // Non-logged in users: prefer local cached IDs

          const raw = localStorage.getItem('local_bookmarks');

          if (raw) {

            try {

              const ids = JSON.parse(raw) as string[];

              console.log('ServiceSearch: Loaded bookmarks from localStorage:', ids);

              ids.forEach(id => resolved.add(id));

            } catch (e) {

              console.warn('ServiceSearch: Failed to parse local_bookmarks', e);

            }

          }



          // Fallback to cached full objects

          const cached = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);

          (cached || []).forEach(cb => {

            const match = allServices.find(s => s.type === (cb.type || '') && s.name === (cb.name || '') && s.city === (cb.city || ''));

            if (match) resolved.add(match.id);

          });



          setBookmarkedIds(prev => new Set([...Array.from(prev), ...Array.from(resolved)]));

        }

      } catch (e) {

        console.warn('Failed to load bookmarks', e);

      }

    };



    // Load initial bookmarks

    loadBookmarks();



    // Listen for bookmark changes (both local and DB-driven)

    const handleBookmarkChange = () => {

      console.log('ServiceSearch: Received bookmarks change event, reloading bookmarks');

      loadBookmarks();

    };



    window.addEventListener('bookmarks:changed', handleBookmarkChange);

    window.addEventListener('wishlist:changed', handleBookmarkChange);

    return () => {

      window.removeEventListener('bookmarks:changed', handleBookmarkChange);

      window.removeEventListener('wishlist:changed', handleBookmarkChange);

    };

  }, [user, allServices]);



  // Reconcile cached bookmarks (full objects) with current service IDs

  useEffect(() => {

    try {

      const cached = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);

      if (cached && cached.length > 0 && allServices.length > 0) {

        const resolved = new Set<string>();

        cached.forEach(cb => {

          const match = allServices.find(s => s.type === (cb.type || '') && s.name === (cb.name || '') && s.city === (cb.city || ''));

          if (match) resolved.add(match.id);

        });

        if (resolved.size > 0) {

          // Merge with any existing bookmarked ids (e.g., from local_bookmarks)

          setBookmarkedIds(prev => new Set([...Array.from(prev), ...Array.from(resolved)]));

        }

      }

    } catch (e) {

      // Ignore reconciliation errors

    }

  }, [allServices]);



  // If user is logged in, reconcile wishlist items from DB with current services

  useEffect(() => {

    const reconcileDbWishlist = async () => {

      if (!user || allServices.length === 0) return;

      try {

        const itemsMap = await UserStorage.getWishlistItemsFromDB();

        const resolved = new Set<string>();



        // itemsMap: { service_id: service_data }

        Object.keys(itemsMap).forEach(dbId => {

          // Try direct ID match first

          const direct = allServices.find(s => s.id === dbId);

          if (direct) {

            resolved.add(direct.id);

            return;

          }



          // Fallback: try to match by service_data fields (type, name, city)

          const sd = itemsMap[dbId] || {};

          if (sd && (sd.name || sd.type)) {

            const match = allServices.find(s => s.type === (sd.type || '') && s.name === (sd.name || '') && s.city === (sd.city || ''));

            if (match) resolved.add(match.id);

          }

        });



        if (resolved.size > 0) {

          setBookmarkedIds(prev => new Set([...Array.from(prev), ...Array.from(resolved)]));

        }

      } catch (e) {

        console.warn('Failed to reconcile DB wishlist with current services', e);

      }

    };



    reconcileDbWishlist();

  }, [user, allServices]);



  // Use robust filtering utility for filtered services

  const filteredServices = useMemo(() => {

    const filterCriteria: FilterCriteria = {

      searchQuery: criteria.searchQuery,

      selectedCity: criteria.selectedCity,

      selectedTypes: criteria.selectedTypes,

      priceRange: criteria.priceRange,

      minRating: criteria.minRating,

      areaQuery: areaQuery || criteria.areaQuery,

      foodQuery: foodQuery || criteria.foodQuery,

      tiffinQuery: tiffinQuery || criteria.tiffinQuery

    };



    const result = applyAdvancedFilters(allServices, filterCriteria);



    // ✅ Copy array before sorting to avoid mutation

    const sorted = [...result];



    if (sortOrder === 'priceLowToHigh') {

      sorted.sort((a, b) => convertToMonthlyPrice(a) - convertToMonthlyPrice(b));

    } else if (sortOrder === 'priceHighToLow') {

      sorted.sort((a, b) => convertToMonthlyPrice(b) - convertToMonthlyPrice(a));

    }



    return sorted;

  }, [

    allServices,

    criteria.searchQuery,

    criteria.selectedCity,

    JSON.stringify(criteria.selectedTypes),

    JSON.stringify(criteria.priceRange),

    criteria.minRating,

    areaQuery,

    foodQuery,

    tiffinQuery,

    sortOrder

  ]);





  const cities = [...new Set(allServices.map(s => s.city))].sort();

  const serviceTypes = [

    { value: 'accommodation', label: 'Accommodation' },

    { value: 'food', label: 'Food' },

    { value: 'tiffin', label: 'Tiffin Service' },

    { value: 'transport', label: 'Transport' }

  ];



  const toggleServiceType = (type: string) => {

    // Special handling for transport - open modal instead of adding to selected types

    if (type === 'transport') {

      setShowTransportModal(true);

      return;

    }



    setCriteria(prev => {

      const newTypes = prev.selectedTypes.includes(type)

        ? prev.selectedTypes.filter(t => t !== type)

        : [...prev.selectedTypes, type];



      // Reset area, food, and tiffin queries when service types change

      if (!newTypes.includes('accommodation')) setAreaQuery('');

      if (!newTypes.includes('food')) setFoodQuery('');

      if (!newTypes.includes('tiffin')) setTiffinQuery('');



      return { ...prev, selectedTypes: newTypes };

    });

  };



  // Handle transport selection

  const handleTransportSelect = (transportService: Service) => {

    // Add the transport service to the CSV services list

    setCsvServices(prev => [...prev, transportService]);



    // Add transport to selected types to show it in results

    if (!criteria.selectedTypes.includes('transport')) {

      setCriteria(prev => ({ ...prev, selectedTypes: [...prev.selectedTypes, 'transport'] }));

    }



    setShowTransportModal(false);

  };



  const removeServiceType = (type: string) => {

    setCriteria(prev => ({ ...prev, selectedTypes: prev.selectedTypes.filter(t => t !== type) }));

  };



  const clearAllFilters = () => {

    setSearchQuery('');

    setSelectedCity('');

    setSelectedTypes([]);

    setPriceRange([0, 100000]);

    setMinRating(0);

    setAreaQuery('');

    setFoodQuery('');

    setTiffinQuery('');

  };



  const toggleBookmark = async (serviceId: string, service: Service) => {

    if (!user) {

      if (onAuthRequired) {

        onAuthRequired();

      }

      return;

    }



    const isBookmarked = bookmarkedIds.has(serviceId);



    try {

      const bookmarkKey = generateBookmarkKey(service);



      if (isBookmarked) {

        // Remove bookmark (optimistic, functional update to avoid races)

        setBookmarkedIds(prev => {

          const s = new Set(prev);

          s.delete(serviceId);

          return s;

        });



        // Remove from DB

        const success = await UserStorage.removeFromWishlistDB(serviceId);

        if (!success) {

          // Revert optimistic update

          setBookmarkedIds(prev => {

            const s = new Set(prev);

            s.add(serviceId);

            return s;

          });

          throw new Error('Failed to remove bookmark');

        }



        // Update local cache

        try {

          const items = UserStorage.getBookmarkItems();

          delete items[serviceId];

          UserStorage.setBookmarkItems(items);



          const cached = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);

          const filteredCached = cached.filter(item => item.id !== serviceId);

          UserStorage.setItem('cached_bookmarks', JSON.stringify(filteredCached));

        } catch (e) {

          // ignore local cache errors

        }



        // Dispatch event after successful DB operation

        window.dispatchEvent(new CustomEvent('bookmarks:changed'));

      } else {

        // Add bookmark

        // Dedupe locally: check cached bookmark items

        const localItems = UserStorage.getBookmarkItems();



        // Optimistically add to bookmarks for UI (functional update)

        setBookmarkedIds(prev => {

          const s = new Set(prev);

          s.add(serviceId);

          return s;

        });



        const serviceData = {

          id: service.id,

          name: service.name,

          type: service.type,

          city: service.city,

          description: service.description,

          price: service.price,

          rating: service.rating,

          image: service.image,

          features: service.features,

          __bookmark_key: bookmarkKey

        };



        const success = await UserStorage.addToWishlistDB(serviceId, serviceData);

        if (!success) {

          // Revert optimistic add

          setBookmarkedIds(prev => {

            const s = new Set(prev);

            s.delete(serviceId);

            return s;

          });

          throw new Error('Failed to add to bookmarks');

        }



        try {

          const items = UserStorage.getBookmarkItems();

          items[serviceId] = serviceData;

          UserStorage.setBookmarkItems(items);



          const cached = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);

          UserStorage.setItem('cached_bookmarks', JSON.stringify([...cached, serviceData]));

        } catch (e) {

          // ignore local cache errors

        }



        // Dispatch event after successful DB operation

        window.dispatchEvent(new CustomEvent('bookmarks:changed'));

      }

    } catch (error) {

      console.error('Failed to toggle bookmark:', error);

      window.dispatchEvent(new CustomEvent('toast:show', {

        detail: {

          message: error instanceof Error ? error.message : 'Failed to update bookmark',

          type: 'error'

        }

      }));

    }

  };



  // Filter area suggestions based on query - PREFIX MATCH ONLY

  const filteredAreaSuggestions = areaSuggestions.filter(area =>

    area.toLowerCase().startsWith(areaQuery.toLowerCase())

  );



  // Filter food suggestions based on query - SUBSTRING MATCH, show full dish names

  let filteredFoodSuggestions: string[] = [];

  if (foodQuery.trim()) {

    // Gather all food dish names from filtered services

    const allFoodNames = allServices

      .filter(s => s.type === 'food')

      .map(s => s.name)

      .filter(Boolean);

    filteredFoodSuggestions = allFoodNames.filter(name =>

      name.toLowerCase().includes(foodQuery.toLowerCase())

    );

    // Remove duplicates and sort

    filteredFoodSuggestions = Array.from(new Set(filteredFoodSuggestions)).sort();

  } else {

    filteredFoodSuggestions = foodSuggestions;

  }



  // Filter tiffin suggestions based on query - SUBSTRING MATCH, show full tiffin names

  let filteredTiffinSuggestions: string[] = [];

  if (tiffinQuery.trim()) {

    // Gather all tiffin names from filtered services

    const allTiffinNames = allServices

      .filter(s => s.type === 'tiffin')

      .map(s => s.name)

      .filter(Boolean);

    filteredTiffinSuggestions = allTiffinNames.filter(name =>

      name.toLowerCase().includes(tiffinQuery.toLowerCase())

    );

    // Remove duplicates and sort

    filteredTiffinSuggestions = Array.from(new Set(filteredTiffinSuggestions)).sort();

  } else {

    // For tiffin, we'll use the actual tiffin service names as suggestions

    filteredTiffinSuggestions = allServices

      .filter(s => s.type === 'tiffin')

      .map(s => s.name)

      .filter(Boolean);

    filteredTiffinSuggestions = Array.from(new Set(filteredTiffinSuggestions)).sort();

  }



  // Per-type filtering and matching logic removed - using centralized utilities instead



  // Generate combinations via utility

  const combinationResults = useMemo(() => {

    const filterCriteria: FilterCriteria = {

      searchQuery: criteria.searchQuery,

      selectedCity: criteria.selectedCity,

      selectedTypes: criteria.selectedTypes,

      priceRange: criteria.priceRange,

      minRating: criteria.minRating,

      areaQuery: areaQuery || criteria.areaQuery,

      foodQuery: foodQuery || criteria.foodQuery,

      tiffinQuery: tiffinQuery || criteria.tiffinQuery

    };



    return getAllCombinationsSorted(allServices, filterCriteria, { maxCombinations: 1000, maxServicesPerType: 10 });

  }, [allServices, criteria, areaQuery, foodQuery, tiffinQuery]);



  const serviceCombinations = combinationResults.allCombinations.map(c => ({ id: c.id, services: c.services, totalPrice: c.totalMonthlyPrice, types: c.types }));



  // Get service type label

  // @ts-ignore - Will use this function in future implementations

  const getServiceTypeLabel = (type: string) => {

    return serviceTypes.find(t => t.value === type)?.label || type.charAt(0).toUpperCase() + type.slice(1);

  };



  // Scroll detection for sticky filter bar

  useEffect(() => {

    const handleScroll = () => {

      // compute header bottom to decide thresholds

      const headerRect = headerRef.current?.getBoundingClientRect();

      const headerBottom = headerRect ? Math.floor(headerRect.bottom) : 64;

      // If filters overlay is open, do not show the sticky bar (mutual exclusivity)

      if (showFilters) {

        setShowStickyBar(false);

        // still update stickyTop/measurements

        setStickyTop(Math.max(0, headerBottom - 1));

        if (headerRect) setMeasuredHeaderHeight(Math.floor(headerRect.height));

        return;

      }



      // If resultsRef exists, show sticky when the results top is near the header bottom

      if (resultsRef.current) {

        const r = resultsRef.current.getBoundingClientRect();

        // try to detect the first result row's top

        const firstChild = resultsRef.current.firstElementChild as HTMLElement | null;

        if (firstChild) {

          const firstRect = firstChild.getBoundingClientRect();

          // Show sticky when the top of the first result reaches the header bottom (1px tolerance)

          const shouldShow = firstRect.top <= headerBottom + 1;

          setShowStickyBar(shouldShow);

        } else {

          // fallback to use the container top

          const threshold = headerBottom + 48;

          const shouldShow = r.top <= threshold;

          setShowStickyBar(shouldShow);

        }

      } else if (mainFilterRef.current) {

        const rect = mainFilterRef.current.getBoundingClientRect();

        // fallback: when main filter bottom is scrolled under header

        const shouldShow = rect.bottom <= headerBottom + 1;

        setShowStickyBar(shouldShow);

      }



      // position sticky bar based on header

      setStickyTop(Math.max(0, headerBottom - 1));

      if (headerRect) setMeasuredHeaderHeight(Math.floor(headerRect.height));

    };



    window.addEventListener('scroll', handleScroll, { passive: true });

    // run once to set initial state

    handleScroll();



    return () => {

      window.removeEventListener('scroll', handleScroll as EventListener);

    };

  }, []);



  // Compute filters panel top so it opens correctly whether sticky bar is visible or not

  useEffect(() => {

    const computeTop = () => {

      if (showStickyBar) {

        setFiltersTop(Math.max(0, stickyTop + STICKY_BAR_HEIGHT));

        return;

      }



      if (mainFilterRef.current) {

        const rect = mainFilterRef.current.getBoundingClientRect();

        // position just below the main filter section relative to viewport

        setFiltersTop(Math.max(0, Math.ceil(rect.bottom)));

        return;

      }



      // fallback

      setFiltersTop(Math.max(0, stickyTop + STICKY_BAR_HEIGHT));

    };



    // compute now and on scroll/resize

    computeTop();

    window.addEventListener('scroll', computeTop, { passive: true });

    window.addEventListener('resize', computeTop);

    return () => {

      window.removeEventListener('scroll', computeTop as EventListener);

      window.removeEventListener('resize', computeTop as EventListener);

    };

  }, [showFilters, showStickyBar, stickyTop, mainFilterRef.current]);



  return (

    <div className="space-y-4 sm:space-y-6">

      {/* Header */}

      <div className="text-center px-4">

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">Find Services</h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-2">

          Discover the best city services tailored to your needs and budget

        </p>

      </div>



      {/* Sticky Floating Filter Bar - appears when main filter scrolls out */}

      {showStickyBar && (

        <div className="sticky left-0 right-0 bg-white border-b border-slate-200 shadow-md overflow-x-auto" style={{ top: `${Math.max(0, stickyTop)}px`, zIndex: 40 }}>

          <div className="max-w-7xl mx-auto px-3 py-2 min-w-[280px]">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">

              <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">

                {/* Search Bar (compact) */}

                <div className="relative flex-1 min-w-[120px] max-w-xs">

                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Search..."
                    value={criteria.searchQuery}
                    onChange={(e) => {
                      console.log('Modal search input change:', e.target.value);
                      setCriteria(prev => ({ ...prev, searchQuery: e.target.value }));
                    }}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500 bg-white"
                  />                </div>



                {/* Clear Filters - match main filter style with icon */}

                <button

                  onClick={() => clearAllFilters()}

                  className="h-10 min-w-[40px] flex items-center justify-center px-2 sm:px-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors text-sm font-medium whitespace-nowrap flex-shrink-0"

                >

                  <X className="w-5 h-5" />

                  <span className="hidden sm:inline ml-1">Clear Filters</span>

                </button>

              </div>



              <div className="flex items-center gap-2 flex-shrink-0 justify-between sm:justify-end">

                {/* Filter Button */}

                <button

                  onClick={() => {

                    // close sticky bar when opening filters from sticky area

                    const opening = !showFilters;

                    setShowStickyBar(false);

                    setShowFilters(opening);

                    setFiltersOpenedFrom(opening ? 'sticky' : null);

                  }}

                  className="h-10 min-w-[40px] flex items-center justify-center px-2 sm:px-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors whitespace-nowrap text-sm flex-shrink-0"

                >

                  <SlidersHorizontal className="w-5 h-5 text-slate-600" />

                  <span className="font-medium text-slate-700 hidden sm:inline ml-1">Filters</span>

                </button>



                {/* Sort Dropdown */}

                <select

                  value={sortOrder}

                  onChange={(e) => setSortOrder(e.target.value as 'priceLowToHigh' | 'priceHighToLow')}

                  className="px-2 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 min-w-[100px] max-w-[140px] flex-shrink-0"

                  aria-label="Sort services by price"

                >

                  <option value="priceLowToHigh">Price: Low to High</option>

                  <option value="priceHighToLow">Price: High to Low</option>

                </select>



                {/* Grid/List Toggle */}

                <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 text-xs flex-shrink-0">

                  <button

                    onClick={() => setViewMode('grid')}

                    className={`flex items-center px-2 py-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'

                      }`}

                  >

                    <Grid className="w-3 h-3" />

                    <span className="ml-1 hidden sm:inline">Grid</span>

                  </button>

                  <button

                    onClick={() => setViewMode('list')}

                    className={`flex items-center px-2 py-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'

                      }`}

                  >

                    <List className="w-3 h-3" />

                    <span className="ml-1 hidden sm:inline">List</span>

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

       

      )

      }



      {/* Filters Panel - opens when showFilters is true; show condensed sticky panel only when opened from sticky */}

      {

        showFilters && filtersOpenedFrom === 'sticky' && showStickyBar && (

          <div

            className="fixed left-0 right-0 bg-white border-b border-slate-200 shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto"

            style={{ top: "80px", zIndex: 45 }}

          >

            <div className="max-w-7xl mx-auto px-3 py-3">

              <div className="space-y-3 p-3 bg-slate-50 rounded-lg max-h-[80vh] overflow-y-auto">

                {/* Copy of condensed filter controls for the sticky view */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* City Filter */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>

                    <select

                      value={selectedCity}

                      onChange={(e) => setSelectedCity(e.target.value)}

                      className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 text-slate-900"

                    >

                      <option value="">All Cities</option>

                      {cities.map(city => (

                        <option key={city} value={city}>{city}</option>

                      ))}

                    </select>

                  </div>



                  {/* Service Types */}

                  <div className="relative">

                    <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>

                    <div className="relative">

                      <button

                        onClick={() => setServiceTypeDropdownOpen(!serviceTypeDropdownOpen)}

                        className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-slate-300 focus:ring-2 focus:ring-slate-700"

                      >

                        <span className="text-slate-900">Select service types</span>

                        <ChevronDown className="w-4 h-4 text-slate-400" />

                      </button>



                      {serviceTypeDropdownOpen && (

                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">

                          {serviceTypes.map(type => (

                            <label key={type.value} className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer">

                              <input

                                type="checkbox"

                                checked={selectedTypes.includes(type.value)}

                                onChange={() => toggleServiceType(type.value)}

                                className="w-4 h-4 text-slate-700 border-slate-300 rounded focus:ring-2 focus:ring-slate-700 focus:ring-offset-0"

                              />

                              <span className="ml-3 text-sm text-slate-700">{type.label}</span>

                            </label>

                          ))}

                        </div>

                      )}

                    </div>

                  </div>



                  {/* Price Range */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">

                      Budget: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()} per month

                    </label>

                    <div className="relative px-2">

                      <div className="relative h-6">

                        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded"></div>



                        <div

                          className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-slate-700 rounded"

                          style={{

                            left: `${(priceRange[0] / 100000) * 100}%`,

                            width: `${((priceRange[1] - priceRange[0]) / 100000) * 100}%`

                          }}

                        ></div>



                        <input

                          type="range"

                          min={0}

                          max={100000}

                          step={1000}

                          value={priceRange[0]}

                          onChange={(e) => {

                            const value = Number(e.target.value);

                            if (value <= priceRange[1]) {

                              setPriceRange([value, priceRange[1]]);

                            }

                          }}

                          className="absolute w-full h-6 bg-transparent cursor-pointer dual-range"

                        />



                        <input

                          type="range"

                          min={0}

                          max={100000}

                          step={1000}

                          value={priceRange[1]}

                          onChange={(e) => {

                            const value = Number(e.target.value);

                            if (value >= priceRange[0]) {

                              setPriceRange([priceRange[0], value]);

                            }

                          }}

                          className="absolute w-full h-6 bg-transparent cursor-pointer dual-range"

                        />

                      </div>



                      <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">

                        <span>₹0</span>

                        <span>₹1,00,000</span>

                      </div>

                    </div>

                  </div>



                  {/* Rating Filter (sticky condensed) */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Rating: {minRating}★</label>

                    <div className="relative px-2">

                      <div className="relative h-6">

                        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded"></div>

                        <input

                          type="range"

                          min={0}

                          max={5}

                          step={0.5}

                          value={minRating}

                          onChange={(e) => setMinRating(Number(e.target.value))}

                          className="absolute w-full h-6 bg-transparent slider"

                        />

                      </div>

                      <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">

                        <span>0</span>

                        <span>5</span>

                      </div>

                    </div>

                  </div>



                  {/* Conditional Area/Food/Tiffin inputs for sticky view */}

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Area Name - shown when accommodation selected */}

                    {selectedTypes.includes('accommodation') && (

                      <div className="relative">

                        <label className="block text-sm font-medium text-slate-700 mb-2">Area Name</label>

                        <input

                          type="text"

                          placeholder="Type area name (e.g., Vaishno, Bodakdev)..."

                          value={areaQuery}

                          onChange={(e) => {

                            setAreaQuery(e.target.value);

                            setShowAreaSuggestions(e.target.value.length > 0);

                          }}

                          onFocus={() => setShowAreaSuggestions(true)}

                          onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 300)}

                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500 bg-white"

                        />



                        {showAreaSuggestions && filteredAreaSuggestions.length > 0 && (

                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">

                            {filteredAreaSuggestions.map(area => (

                              <button

                                key={area}

                                onMouseDown={(e) => {

                                  e.preventDefault();

                                  setAreaQuery(area);

                                  setShowAreaSuggestions(false);

                                }}

                                className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-slate-50 text-xs sm:text-sm text-slate-700"

                              >

                                {area}

                              </button>

                            ))}

                          </div>

                        )}

                      </div>

                    )}



                    {/* Food Type - shown when food selected */}

                    {selectedTypes.includes('food') && (

                      <div className="relative">

                        <label className="block text-sm font-medium text-slate-700 mb-2">Food Type</label>

                        <input

                          type="text"

                          placeholder="Type food type (e.g., Gujarati, South Indian)..."

                          value={foodQuery}

                          onChange={(e) => {

                            setFoodQuery(e.target.value);

                            setShowFoodSuggestions(e.target.value.length > 0);

                          }}

                          onFocus={() => setShowFoodSuggestions(true)}

                          onBlur={() => setTimeout(() => setShowFoodSuggestions(false), 300)}

                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500 bg-white"

                        />



                        {showFoodSuggestions && filteredFoodSuggestions.length > 0 && (

                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">

                            {filteredFoodSuggestions.map(food => (

                              <button

                                key={food}

                                onMouseDown={(e) => {

                                  e.preventDefault();

                                  setFoodQuery(food);

                                  setShowFoodSuggestions(false);

                                }}

                                className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"

                              >

                                {food}

                              </button>

                            ))}

                          </div>

                        )}

                      </div>

                    )}



                    {/* Tiffin Name - shown when tiffin selected */}

                    {selectedTypes.includes('tiffin') && (

                      <div className="relative">

                        <label className="block text-sm font-medium text-slate-700 mb-2">Tiffin Name</label>

                        <input

                          type="text"

                          placeholder="Type tiffin name (e.g., Sharma Tiffin, Patel Tiffin)..."

                          value={tiffinQuery}

                          onChange={(e) => {

                            setTiffinQuery(e.target.value);

                            setShowTiffinSuggestions(e.target.value.length > 0);

                          }}

                          onFocus={() => setShowTiffinSuggestions(true)}

                          onBlur={() => setTimeout(() => setShowTiffinSuggestions(false), 300)}

                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500 bg-white"

                        />



                        {showTiffinSuggestions && filteredTiffinSuggestions.length > 0 && (

                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">

                            {filteredTiffinSuggestions.map(tiffin => (

                              <button

                                key={tiffin}

                                onMouseDown={(e) => {

                                  e.preventDefault();

                                  setTiffinQuery(tiffin);

                                  setShowTiffinSuggestions(false);

                                }}

                                className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"

                              >

                                {tiffin}

                              </button>

                            ))}

                          </div>

                        )}

                      </div>

                    )}

                  </div>

                  {/* Close button */}

                  <div className="flex justify-end">

                    <button

                      onClick={() => setShowFilters(false)}

                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"

                    >

                      Apply Filters

                    </button>

                  </div>

                </div>

              </div>

            </div>

              

          </div>

        )}

      {/* Main Search and Filters Section */}

      <div ref={mainFilterRef} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">

        {/* Search Bar */}

        <div className="relative mb-6">          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />          <input
            type="text"
            placeholder="Search services, cities, or areas..."
            value={criteria.searchQuery}
            onChange={(e) => {
              console.log('Search input change:', e.target.value);
              setCriteria(prev => ({ ...prev, searchQuery: e.target.value }));
            }}
            className="w-full pl-12 pr-4 py-4 text-base border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-700/10 focus:border-slate-700 text-slate-900 placeholder-slate-500 bg-white shadow-sm hover:border-slate-300 transition-all duration-200"
          />        </div>



        {/* Filter Toggle */}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">

          <div className="flex gap-2">

            <button

              onClick={() => {

                // open filters from main area

                const opening = !showFilters;

                setShowStickyBar(false);

                setShowFilters(opening);

                setFiltersOpenedFrom(opening ? 'main' : null);

              }}

              className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"

            >

              <SlidersHorizontal className="w-4 h-4 text-slate-600" />

              <span className="text-sm font-medium text-slate-700">Filters</span>

            </button>

            <button

              onClick={() => {

                setSearchQuery('');

                setSelectedCity('');

                setSelectedTypes([]);

                setPriceRange([0, 100000]);

                setMinRating(0);

                setAreaQuery('');

                setFoodQuery('');

                setTiffinQuery('');

              }}

              className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"

            >

              <X className="w-4 h-4" />

              <span className="text-sm font-medium">Clear Filters</span>

            </button>

          </div>



          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            <span className="text-xs sm:text-sm text-slate-600">{filteredServices.length} results</span>



            {/* Sort Box */}

            <select

              value={sortOrder}

              onChange={(e) => setSortOrder(e.target.value as 'priceLowToHigh' | 'priceHighToLow')}

              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 flex-1 sm:flex-none"

              aria-label="Sort services by price"

            >

              <option value="priceLowToHigh">Price: Low to High</option>

              <option value="priceHighToLow">Price: High to Low</option>

            </select>



            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">

              <button

                onClick={() => setViewMode('grid')}

                className={`flex items-center px-2 py-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'

                  }`}

              >

                <Grid className="w-4 h-4" />

                <span className="ml-2 text-sm md:text-base">Grid</span>

              </button>

              <button

                onClick={() => setViewMode('list')}

                className={`flex items-center px-2 py-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'

                  }`}

              >

                <List className="w-4 h-4" />

                <span className="ml-2 text-sm md:text-base">List</span>

              </button>

            </div>

          </div>

        </div>



        {/* Filters Panel */}

        {showFilters && (

          <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl animate-slide-up">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">



              {/* Service Type Filter - Enhanced Multi-Select */}

              <div className="relative">

                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Service Type</label>

                <div className="relative">

                  <button

                    onClick={() => setServiceTypeDropdownOpen(!serviceTypeDropdownOpen)}

                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-slate-300 focus:ring-2 focus:ring-slate-700 focus:border-slate-700"

                  >

                    <span className="text-slate-900">Select service types</span>

                    <ChevronDown className="w-4 h-4 text-slate-400" />

                  </button>



                  {serviceTypeDropdownOpen && (

                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">

                      {serviceTypes.map(type => (

                        <label key={type.value} className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer">

                          <input

                            type="checkbox"

                            checked={selectedTypes.includes(type.value)}

                            onChange={() => toggleServiceType(type.value)}

                            className="w-4 h-4 text-slate-700 border-slate-300 rounded focus:ring-2 focus:ring-slate-700 focus:ring-offset-0"

                          />

                          <span className="ml-3 text-sm text-slate-700">{type.label}</span>

                        </label>

                      ))}

                    </div>

                  )}

                </div>



                {/* Selected Service Types */}

                {selectedTypes.length > 0 && (

                  <div className="flex flex-wrap gap-2 mt-2">

                    {selectedTypes.map(type => (

                      <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-white">

                        {serviceTypes.find(t => t.value === type)?.label}

                        <button

                          onClick={() => removeServiceType(type)}

                          className="ml-2 hover:bg-slate-600 rounded-full p-0.5"

                        >

                          <X className="w-3 h-3" />

                        </button>

                      </span>

                    ))}

                  </div>

                )}

              </div>



              {/* City Filter */}

              <div>

  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">City</label>

  <select

    value={selectedCity}

    onChange={(e) => setSelectedCity(e.target.value)}

    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 bg-white text-slate-900"

  >

    <option value="">All Cities</option>

    {cities

      .filter(city => city && city.toLowerCase() !== 'city') // <- filter out the unwanted "City"

      .map(city => (

        <option key={city} value={city}>{city}</option>

      ))

    }

  </select>

</div>





              {/* Rating Filter */}

              <div>

                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">

                  Min Rating: {minRating}★

                </label>

                <div className="relative px-2">

                  <div className="relative h-6">

                    <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded"></div>

                    <input

                      type="range"

                      min={0}

                      max={5}

                      step={0.5}

                      value={minRating}

                      onChange={(e) => setMinRating(Number(e.target.value))}

                      className="absolute w-full h-6 bg-transparent slider"

                    />

                  </div>

                  <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">

                    <span>0</span>

                    <span>5</span>

                  </div>

                </div>

              </div>

            </div>



            {/* Enhanced Price Range */}

            <div>

              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">

                Budget: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()} per month

              </label>

              <div className="relative px-2">

                {/* Dual Range Slider Container */}

                <div className="relative h-6">

                  {/* Track Background */}

                  <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded"></div>



                  {/* Active Range */}

                  <div

                    className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-slate-700 rounded"

                    style={{

                      left: `${(priceRange[0] / 100000) * 100}%`,

                      width: `${((priceRange[1] - priceRange[0]) / 100000) * 100}%`

                    }}

                  ></div>



                  {/* Min Range Input */}

                  <input

                    type="range"

                    min={0}

                    max={100000}

                    step={1000}

                    value={priceRange[0]}

                    onChange={(e) => {

                      const value = Number(e.target.value);

                      if (value <= priceRange[1]) {

                        setPriceRange([priceRange[0], value]);

                      }

                    }}

                    className="absolute w-full h-6 bg-transparent cursor-pointer dual-range"

                  />



                  {/* Max Range Input */}

                  <input

                    type="range"

                    min={0}

                    max={100000}

                    step={1000}

                    value={priceRange[1]}

                    onChange={(e) => {

                      const value = Number(e.target.value);

                      if (value >= priceRange[0]) {

                        setPriceRange([priceRange[0], value]);

                      }

                    }}

                    className="absolute w-full h-6 bg-transparent cursor-pointer dual-range"

                  />

                </div>



                {/* Labels */}

                <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">

                  <span>₹0</span>

                  <span>₹1,00,000</span>

                </div>

              </div>

            </div>



            {/* Conditional Area Filter */}

            {selectedTypes.includes('accommodation') && (

              <div className="relative">

                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Area Name</label>

                <input

                  type="text"

                  placeholder="Type area name (e.g., Vaishno, Bodakdev)..."

                  value={areaQuery}

                  onChange={(e) => {

                    setAreaQuery(e.target.value);

                    setShowAreaSuggestions(e.target.value.length > 0);

                  }}

                  onFocus={() => setShowAreaSuggestions(true)}

                  onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 300)}

                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500"

                />



                {showAreaSuggestions && filteredAreaSuggestions.length > 0 && (

                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">

                    {filteredAreaSuggestions.map(area => (

                      <button

                        key={area}

                        onMouseDown={(e) => {

                          e.preventDefault();

                          setAreaQuery(area);

                          setShowAreaSuggestions(false);

                        }}

                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-slate-50 text-xs sm:text-sm text-slate-700"

                      >

                        {area}

                      </button>

                    ))}

                  </div>

                )}

              </div>

            )}



            {/* Conditional Food Filter */}

            {(selectedTypes.includes('food')) && (

              <div className="relative">

                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Food Type</label>

                <input

                  type="text"

                  placeholder="Type food type (e.g., Gujarati, South Indian)..."

                  value={foodQuery}

                  onChange={(e) => {

                    setFoodQuery(e.target.value);

                    setShowFoodSuggestions(e.target.value.length > 0);

                  }}

                  onFocus={() => setShowFoodSuggestions(true)}

                  onBlur={() => setTimeout(() => setShowFoodSuggestions(false), 300)}

                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500"

                />



                {showFoodSuggestions && filteredFoodSuggestions.length > 0 && (

                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">

                    {filteredFoodSuggestions.map(food => (

                      <button

                        key={food}

                        onMouseDown={(e) => {

                          e.preventDefault();

                          setFoodQuery(food);

                          setShowFoodSuggestions(false);

                        }}

                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"

                      >

                        {food}

                      </button>

                    ))}

                  </div>

                )}

              </div>

            )}



            {/* Conditional Tiffin Filter */}

            {(selectedTypes.includes('tiffin')) && (

              <div className="relative">

                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Tiffin Name</label>

                <input

                  type="text"

                  placeholder="Type tiffin name (e.g., Sharma Tiffin, Patel Tiffin)..."

                  value={tiffinQuery}

                  onChange={(e) => {

                    setTiffinQuery(e.target.value);

                    setShowTiffinSuggestions(e.target.value.length > 0);

                  }}

                  onFocus={() => setShowTiffinSuggestions(true)}

                  onBlur={() => setTimeout(() => setShowTiffinSuggestions(false), 300)}

                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500"

                />



                {showTiffinSuggestions && filteredTiffinSuggestions.length > 0 && (

                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">

                    {filteredTiffinSuggestions.map(tiffin => (

                      <button

                        key={tiffin}

                        onMouseDown={(e) => {

                          e.preventDefault();

                          setTiffinQuery(tiffin);

                          setShowTiffinSuggestions(false);

                        }}

                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"

                      >

                        {tiffin}

                      </button>

                    ))}

                  </div>

                )}

              </div>

            )}

          </div>

        )}

      </div>



      {/* Loading State */}

      {

        loading && (

          <div className="text-center py-12">

            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>

            <p className="text-slate-600 mt-4">Loading services...</p>

          </div>

        )

      }



      {/* Results */}

      {

        !loading && (

          <div className="space-y-6">

            {/* Tab Navigation - show only when we have combinations */}

            {selectedTypes.length > 1 && serviceCombinations.length > 0 && (

              <div className="border-b border-slate-200">

                <div className="flex space-x-8">

                  <button

                    onClick={() => setActiveView('combined')}

                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'combined'

                      ? 'border-blue-500 text-blue-600'

                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'

                      }`}

                  >

                    Combined Services

                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">

                      {serviceCombinations.length}

                    </span>

                  </button>

                  <button

                    onClick={() => setActiveView('individual')}

                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'individual'

                      ? 'border-blue-500 text-blue-600'

                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'

                      }`}

                  >

                    Individual Services

                    <span className="ml-2 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">

                      {filteredServices.length}

                    </span>

                  </button>

                </div>

              </div>

            )}



            {/* Combined Services Tab Content */}

            {selectedTypes.length > 1 && serviceCombinations.length > 0 && activeView === 'combined' && (

              <div>

                <div className="flex items-center justify-between mb-4">

                  <h2 className="text-xl font-bold text-slate-900">

                    Combined Services Within Budget

                  </h2>

                  <span className="text-sm text-slate-600">

                    {serviceCombinations.length} combinations found

                  </span>

                </div>



                <div className="grid gap-4">

                  {serviceCombinations

                    .slice(0, combinationPage * COMBINATIONS_PER_PAGE)

                    .map((combination) => (

                      <ServiceCombinationCard

                        key={combination.id}

                        combination={combination}

                        onViewDetails={setSelectedService}

                        onToggleBookmark={() => {

                          // Add any services in this combination that aren't bookmarked yet

                          combination.services.forEach(svc => {

                            if (!bookmarkedIds.has(svc.id)) {

                              // toggleBookmark will handle auth checks and optimistic UI

                              toggleBookmark(svc.id, svc);

                            }

                          });

                        }}

                        onToggleBookmarkService={(svc) => toggleBookmark(svc.id, svc)}

                        isBookmarkedForService={(id) => bookmarkedIds.has(id)}

                        isBookmarked={combination.services.every(svc => bookmarkedIds.has(svc.id))}

                      />

                    ))}

                </div>

                {serviceCombinations.length > combinationPage * COMBINATIONS_PER_PAGE && (

                  <div className="flex justify-center mt-6">

                    <button

                      className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"

                      onClick={() => setCombinationPage(combinationPage + 1)}

                    >

                      Load More

                    </button>

                  </div>

                )}

              </div>

            )}



            {/* Individual Services Tab Content */}

            {(activeView === 'individual' || serviceCombinations.length === 0) && (

              <div>

                {selectedTypes.length > 1 && serviceCombinations.length > 0 && (

                  <div className="flex items-center justify-between mb-4">

                    <h2 className="text-xl font-bold text-slate-900">Individual Services</h2>

                    <span className="text-sm text-slate-600">

                      {filteredServices.length} services found

                    </span>

                  </div>

                )}



                {/* Individual services */}

                <div ref={resultsRef} className={`grid gap-6 ${viewMode === 'grid'

                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

                  : 'grid-cols-1'

                  }`}>

                  {filteredServices.slice(0, individualPage * INDIVIDUALS_PER_PAGE).map((service) => (

                    <ServiceCard

                      key={service.id}

                      service={service}

                      isBookmarked={bookmarkedIds.has(service.id)}

                      onToggleBookmark={() => toggleBookmark(service.id, service)}

                      onViewDetails={() => setSelectedService(service)}

                      viewMode={viewMode}

                    />

                  ))}

                </div>

                {filteredServices.length > individualPage * INDIVIDUALS_PER_PAGE && (

                  <div className="flex justify-center mt-6">

                    <button

                      className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"

                      onClick={() => setIndividualPage(individualPage + 1)}

                    >

                      Load More

                    </button>

                  </div>

                )}

              </div>

            )}

          </div>

        )

      }



      {/* Empty State */}

      {

        !loading && filteredServices.length === 0 && serviceCombinations.length === 0 && (

          <div className="text-center py-16">

            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">

              <Search className="w-8 h-8 text-slate-400" />

            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">No services found</h3>

            <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>

            <button

              onClick={() => {

                setSearchQuery('');

                setSelectedCity('');

                setSelectedTypes([]);

                setPriceRange([0, 100000]);

                setMinRating(0);

                setAreaQuery('');

                setFoodQuery('');

                setTiffinQuery('');

              }}

              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"

            >

              Clear All Filters

            </button>

          </div>

        )

      }



      {/* Service Details Modal */}

      {

        selectedService && (

          <ServiceDetails

            service={selectedService}

            onClose={() => setSelectedService(null)}

          />

        )

      }



      {/* Transport Modal */}

      <TransportModal

        isOpen={showTransportModal}

        onClose={() => setShowTransportModal(false)}

        onSelectTransport={handleTransportSelect}

      />

    </div >

  );

};



export default ServiceSearch;

