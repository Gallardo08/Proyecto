import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixPublicationDates() {
  console.log('🔧 Iniciando corrección de fechas de publicación...');

  try {
    // Obtener todos los productos
    const { data: products, error } = await supabase
      .from('products')
      .select('id, fecha_publicacion, created_at, nombre');

    if (error) {
      console.error('Error al obtener productos:', error);
      return;
    }

    console.log(`📦 Se encontraron ${products.length} productos`);
    console.log('\n📋 Fechas actuales de publicación:');
    
    // Mostrar las fechas actuales para diagnóstico
    products.forEach(product => {
      console.log(`ID: ${product.id}, Nombre: ${product.nombre}, Fecha: ${product.fecha_publicacion}, Created: ${product.created_at}`);
    });

    let fixedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Verificar si la fecha de publicación es null, undefined o inválida
      const needsFix = !product.fecha_publicacion || 
                       product.fecha_publicacion === '' ||
                       isNaN(new Date(product.fecha_publicacion).getTime());

      if (needsFix) {
        // Usar created_at como fecha de publicación
        const publicationDate = product.created_at || new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ fecha_publicacion: publicationDate })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ Error al actualizar producto ${product.id}:`, updateError);
        } else {
          console.log(`✅ Producto ${product.id} actualizado: ${publicationDate}`);
          fixedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`✅ Productos actualizados: ${fixedCount}`);
    console.log(`⏭️  Productos omitidos (ya tenían fecha válida): ${skippedCount}`);
    console.log('🎉 Proceso completado');

  } catch (error) {
    console.error('Error durante el proceso:', error);
  }
}

fixPublicationDates();
