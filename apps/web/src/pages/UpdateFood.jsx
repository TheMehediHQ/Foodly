import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import axiosSecure from "../api/axios";

const UpdateFood = () => {
  const loaderRes = useLoaderData();
  const foodData = loaderRes?.data?.data || loaderRes?.data || loaderRes;

  // Initialize state from loader data
  const [formData, setFormData] = useState({
    foodName: "",
    category: "",
    description: "",
    expiryDate: "",
    quantity: "",
    storageInstructions: "",
  });

  useEffect(() => {
    if (foodData) {
      setFormData({
        foodName: foodData.title || foodData.foodName || "",
        category: foodData.category || "",
        description: foodData.description || "",
        expiryDate: foodData.expiryDate ? foodData.expiryDate.slice(0, 10) : "",
        quantity: foodData.quantity || "",
        storageInstructions: foodData.storageInstructions || "",
      });
    }
  }, [foodData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormUpdate = (e) => {
    e.preventDefault();

    axiosSecure.put(`/foods/${foodData._id}`, formData)
      .then((res) => {
        const result = res.data;
        if (result.modifiedCount || result.ok) {
          Swal.fire({
            title: "Food Updated Successfully!",
            icon: "success",
            draggable: true,
          });
        } else {
          Swal.fire({
            title: "No changes were made",
            icon: "info",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "Update Failed",
          text: error.message,
          icon: "error",
        });
      });
  };

  return (
    <div className="bg-gradient-to-r from-yellow-100 to-yellow-300 dark:from-gray-800 dark:to-gray-900 p-8 min-h-screen">
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-700 dark:text-yellow-400">
          Update Food
        </h2>
        <form onSubmit={handleFormUpdate} className="space-y-5">
          {/* Food Name */}
          <div>
            <label htmlFor="foodName" className="block font-medium">
              Food Name
            </label>
            <input
              id="foodName"
              name="foodName"
              type="text"
              value={formData.foodName}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block font-medium">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            >
              <option value="">Select a category</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="dairy">Dairy</option>
              <option value="grains">Grains</option>
              <option value="meat">Meat</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="expiryDate" className="block font-medium">
              Expiry Date
            </label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block font-medium">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>

          {/* Storage Instructions */}
          <div>
            <label htmlFor="storageInstructions" className="block font-medium">
              Storage Instructions
            </label>
            <textarea
              id="storageInstructions"
              name="storageInstructions"
              value={formData.storageInstructions}
              onChange={handleChange}
              rows="2"
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 dark:hover:bg-yellow-500 transition"
            >
              Update Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFood;
