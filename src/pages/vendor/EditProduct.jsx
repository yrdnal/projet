import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, updateProduct, fetchCategories } from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, categories, loading } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    sku: '',
    stock: '',
  });

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchCategories());
  }, [id, dispatch]);

  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name || '',
        description: currentProduct.description || '',
        price: currentProduct.price || '',
        compareAtPrice: currentProduct.compareAtPrice || '',
        categoryId: currentProduct.categoryId || '',
        sku: currentProduct.sku || '',
        stockQuantity: currentProduct.stockQuantity || currentProduct.stock_quantity || '',
      });
    }
  }, [currentProduct]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
      categoryId: formData.categoryId,
      sku: formData.sku,
      stockQuantity: parseInt(formData.stockQuantity),
    };

    try {
      await dispatch(updateProduct({ id, productData: data })).unwrap();
      alert('Product updated successfully');
      navigate('/vendor/products');
    } catch (error) {
      alert(error || 'Failed to update product');
    }
  };

  if (loading || !currentProduct) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  return (
    <div>
      <h1 className="heading-2 mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card p-6 space-y-6">
          <div>
            <label className="form-label">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="input"
                required
              />
            </div>
            <div>
              <label className="form-label">Compare at Price</label>
              <input
                type="number"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleChange}
                step="0.01"
                className="input"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Updating...' : 'Update Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;

// Made with Bob
