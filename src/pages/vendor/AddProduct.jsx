import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, fetchCategories } from '../../store/slices/productSlice';
import { PhotoIcon } from '@heroicons/react/24/outline';

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    sku: '',
    stockQuantity: '',
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Valid stock quantity is required';
    }
    if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const productData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        productData.append(key, formData[key]);
      }
    });
    images.forEach((image) => {
      productData.append('images', image);
    });

    try {
      await dispatch(createProduct(productData)).unwrap();
      alert('Product created successfully');
      navigate('/vendor/products');
    } catch (error) {
      alert(error || 'Failed to create product');
    }
  };

  return (
    <div>
      <h1 className="heading-2 mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`input ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe your product"
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>

          {/* Price & Compare Price */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Prix *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">Ar</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="100"
                  min="0"
                  className={`input pl-8 ${errors.price ? 'input-error' : ''}`}
                  placeholder="0"
                />
              </div>
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>
            <div>
              <label className="form-label">Prix Comparatif</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">Ar</span>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  step="100"
                  min="0"
                  className="input pl-8"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Category & SKU */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`input ${errors.categoryId ? 'input-error' : ''}`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="form-error">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="form-label">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="input"
                placeholder="Product SKU"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="form-label">Stock Quantity *</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              min="0"
              className={`input ${errors.stockQuantity ? 'input-error' : ''}`}
              placeholder="0"
            />
            {errors.stockQuantity && <p className="form-error">{errors.stockQuantity}</p>}
          </div>

          {/* Images */}
          <div>
            <label className="form-label">Product Images * (Max 5)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload images (JPG, PNG)
                </span>
              </label>
            </div>
            {errors.images && <p className="form-error">{errors.images}</p>}

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Product'}
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

export default AddProduct;

// Made with Bob
