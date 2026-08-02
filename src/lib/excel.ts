import { Product } from '@/types';

export interface ImportReport {
  totalProcessed: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Export products to CSV format (fully compatible with Microsoft Excel & Google Sheets)
 */
export const exportProductsToCSV = (products: Product[]): void => {
  const headers = [
    'SKU',
    'Product Name',
    'Category',
    'Brand',
    'Short Description',
    'Variant Name',
    'Variant Weight (kg)',
    'Price (MYR)',
    'Stock',
    'Halal Status',
    'Featured'
  ];

  const rows: string[][] = [headers];

  products.forEach(product => {
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        rows.push([
          `"${product.sku.replace(/"/g, '""')}"`,
          `"${product.productName.replace(/"/g, '""')}"`,
          `"${(product.categoryName || 'General').replace(/"/g, '""')}"`,
          `"${product.brand.replace(/"/g, '""')}"`,
          `"${(product.shortDescription || '').replace(/"/g, '""')}"`,
          `"${variant.variantName.replace(/"/g, '""')}"`,
          String(variant.weight || 1),
          String(variant.price || 0),
          String(variant.stock || 0),
          product.isHalal ? 'YES' : 'NO',
          product.isFeatured ? 'YES' : 'NO',
        ]);
      });
    } else {
      rows.push([
        `"${product.sku.replace(/"/g, '""')}"`,
        `"${product.productName.replace(/"/g, '""')}"`,
        `"${(product.categoryName || 'General').replace(/"/g, '""')}"`,
        `"${product.brand.replace(/"/g, '""')}"`,
        `"${(product.shortDescription || '').replace(/"/g, '""')}"`,
        '"Standard"',
        '1',
        '0',
        '0',
        product.isHalal ? 'YES' : 'NO',
        product.isFeatured ? 'YES' : 'NO',
      ]);
    }
  });

  const csvContent = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FBS_Bakery_Products_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Parse CSV text and import product records into database
 */
export const parseCSVProductData = (csvText: string): { importedProducts: Partial<Product>[]; report: ImportReport } => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  const report: ImportReport = {
    totalProcessed: 0,
    importedCount: 0,
    skippedCount: 0,
    errors: []
  };

  if (lines.length <= 1) {
    report.errors.push('Fail CSV kosong atau hanya berisi baris tajuk.');
    return { importedProducts: [], report };
  }

  const importedProducts: Partial<Product>[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    report.totalProcessed++;
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Simple robust CSV split ignoring commas inside quotes
    const cells = rawLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rawLine.split(',');
    const cleanCells = cells.map(c => c.replace(/^"|"$/g, '').trim());

    const sku = cleanCells[0] || '';
    const productName = cleanCells[1] || '';
    const categoryName = cleanCells[2] || 'Flour & Powder';
    const brand = cleanCells[3] || 'FBS Bakery';
    const shortDesc = cleanCells[4] || 'Baking supply ingredient.';
    const variantName = cleanCells[5] || 'Standard Pack';
    const weightNum = parseFloat(cleanCells[6]) || 1.0;
    const priceNum = parseFloat(cleanCells[7]) || 0;
    const stockNum = parseInt(cleanCells[8], 10) || 0;
    const isHalal = (cleanCells[9] || 'YES').toUpperCase() === 'YES';
    const isFeatured = (cleanCells[10] || 'NO').toUpperCase() === 'YES';

    // Column Validation: SKU & Product Name required
    if (!sku || !productName) {
      report.skippedCount++;
      report.errors.push(`Baris ${i + 1}: Diabaikan (SKU atau Nama Produk kosong).`);
      continue;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      report.skippedCount++;
      report.errors.push(`Baris ${i + 1} (${productName}): Diabaikan (Harga tidak sah).`);
      continue;
    }

    // Product entry creation
    const newProd: Partial<Product> = {
      sku,
      productName,
      slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      categoryName,
      brand,
      shortDescription: shortDesc,
      description: shortDesc,
      mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      galleryImages: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop'],
      isHalal,
      isFeatured,
      isBestSeller: false,
      status: true,
      variants: [
        {
          id: `var-imp-${Date.now()}-${i}`,
          productId: '',
          variantName,
          weight: weightNum,
          price: priceNum,
          sku: `${sku}-V1`,
          stock: stockNum,
        }
      ]
    };

    importedProducts.push(newProd);
    report.importedCount++;
  }

  return { importedProducts, report };
};
