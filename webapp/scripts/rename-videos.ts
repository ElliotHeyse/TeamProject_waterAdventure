import { rename } from 'fs/promises';
import { join } from 'path';

const videoDir = 'src/lib/beeldmateriaalZwemfed';

interface VideoMapping {
  oldName: string;
  newName: string;
}

const videoMappings: VideoMapping[] = [
  { oldName: '1AA_PG_2_OEF1A.mp4', newName: 'lesson1_a_ex1_1.mp4' },
  { oldName: '1BA_PG_7_OEF1B_WWles 1.mp4', newName: 'lesson1_b_ex1_2.mp4' },
  { oldName: '1BB_PG_20_OEF1BWWLES3.mp4', newName: 'lesson1_b_ex1_3.mp4' },
  { oldName: '1BC_LO_14_oef1B_LO LES2.mp4', newName: 'lesson1_c_ex1_1.mp4' },
  { oldName: '2AA_PG_12_oef2B_WWLes1.mp4', newName: 'lesson2_a_ex2_1.mp4' },
  { oldName: '2BA_PG 26_oef2b_WWles 5.mp4', newName: 'lesson2_b_ex2_1.mp4' },
  { oldName: '2BB_WG 45_oef2B_wwles10.mp4', newName: 'lesson2_b_ex2_2.mp4' },
  { oldName: '3AA_PG 8_oef3A_WWles1.mp4', newName: 'lesson3_a_ex3_1.mp4' },
  { oldName: '3BA_WG 7_oef3_WWles1B.mp4', newName: 'lesson3_b_ex3_1.mp4' },
  { oldName: '3BB_WG 12_OEf3B_WWles 1.mp4', newName: 'lesson3_b_ex3_2.mp4' },
  { oldName: '4AB_WG 24_oef4A_wwles4.mp4', newName: 'lesson4_a_ex4_1.mp4' },
  { oldName: '4BA_PG 14_oef4B_wwles2.mp4', newName: 'lesson4_b_ex4_1.mp4' },
  { oldName: '4BB_WG 27_oef4B_wwles6.mp4', newName: 'lesson4_b_ex4_2.mp4' },
  { oldName: '5AA_PG 3_oef5A_wwles1.mp4', newName: 'lesson5_a_ex5_1.mp4' },
  { oldName: '5AB_PG 16_oef5A_wwles3.mp4', newName: 'lesson5_a_ex5_2.mp4' },
  { oldName: '6AA_PG 18_oef6A_wwles2.mp4', newName: 'lesson6_a_ex6_1.mp4' },
  { oldName: '6AB_WG 19 X_oef6A_wwles4.mp4', newName: 'lesson6_b_ex6_1.mp4' },
  { oldName: '6AC_PG 36_Oef6A_WWles6.mp4', newName: 'lesson6_c_ex6_1.mp4' },
  { oldName: '6AD_WG 38_oef6A_wwles8.mp4', newName: 'lesson6_d_ex6_1.mp4' },
  { oldName: '6AE_PG 35_oef6A_wwles4.mp4', newName: 'lesson6_e_ex6_1.mp4' },
  { oldName: '6AF_WG 18_oef6A_WWles4.mp4', newName: 'lesson6_f_ex6_1.mp4' },
  { oldName: '6AG_oefLO 61_oef6A_LO les6 v.mp4', newName: 'lesson6_g_ex6_1.mp4' },
  { oldName: '7AA_PG 27_oef7A_WWles3.mp4', newName: 'lesson7_a_ex7_1.mp4' },
  { oldName: '7AB_WG 17 X_oef7A_WWles6.mp4', newName: 'lesson7_b_ex7_1.mp4' },
  { oldName: '7AC_WG 43_oef7A_wwles9.mp4', newName: 'lesson7_c_ex7_1.mp4' },
  { oldName: '7AD_LO_oef 7_lOles3 20.mp4', newName: 'lesson7_d_ex7_1.mp4' }
];

async function renameVideos() {
  console.log('Starting video renaming process...');
  
  for (const mapping of videoMappings) {
    try {
      const oldPath = join(videoDir, mapping.oldName);
      const newPath = join(videoDir, mapping.newName);
      
      await rename(oldPath, newPath);
      console.log(`✓ Renamed: ${mapping.oldName} → ${mapping.newName}`);
    } catch (error) {
      console.error(`✗ Error renaming ${mapping.oldName}:`, error);
    }
  }
  
  console.log('Video renaming process completed!');
}

renameVideos().catch(console.error); 