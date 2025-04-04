import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import './Blog.css';

const API_URL = "http://localhost:5000";

const Blog = () => {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    // Fetch Blogs
    const fetchBlogs = async () => {
        const response = await fetch(`${API_URL}/blogs`);
        const data = await response.json();
        setBlogs(data);
    };

    // Open Add Blog Form
    const openAddBlogForm = () => {
        Swal.fire({
            title: "Add Blog",
            html: `
                <input type="text" id="title" class="swal2-input" placeholder="Title">
                <textarea id="content" class="swal2-textarea" placeholder="Content"></textarea>
                <input type="text" id="author" class="swal2-input" placeholder="Author">
                <input type="file" id="image"  class="swal2-file">
            `,
            showCancelButton: true,
            confirmButtonText: "Add Blog",
            preConfirm: () => {
                const title = document.getElementById("title").value;
                const content = document.getElementById("content").value;
                const author = document.getElementById("author").value;
                const image = document.getElementById("image").files[0];

                if (!title || !content || !author) {
                    Swal.showValidationMessage("Please fill all fields");
                    return false;
                }

                return { title, content, author, image };
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append("title", result.value.title);
                formData.append("content", result.value.content);
                formData.append("author", result.value.author);
                if (result.value.image) {
                    formData.append("image", result.value.image);
                }

                await fetch(`${API_URL}/blogs`, { method: "POST", body: formData });
                fetchBlogs();
            }
        });
    };

    // Open Edit Blog Form with SweetAlert
    const openEditBlogForm = (blog) => {
        Swal.fire({
            title: "Edit Blog",
            html: `
                <input type="text" id="edit-title" class="swal2-input" placeholder="Title" value="${blog.title}">
                <textarea id="edit-content" class="swal2-textarea" placeholder="Content">${blog.content}</textarea>
                <input type="text" id="edit-author" class="swal2-input" placeholder="Author" value="${blog.author}">
                <input type="file" id="edit-image" class="swal2-file">
            `,
            showCancelButton: true,
            confirmButtonText: "Update Blog",
            preConfirm: () => {
                const title = document.getElementById("edit-title").value;
                const content = document.getElementById("edit-content").value;
                const author = document.getElementById("edit-author").value;
                const image = document.getElementById("edit-image").files[0];

                if (!title || !content || !author) {
                    Swal.showValidationMessage("Please fill all fields");
                    return false;
                }

                return { title, content, author, image };
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append("title", result.value.title);
                formData.append("content", result.value.content);
                formData.append("author", result.value.author);
                if (result.value.image) {
                    formData.append("image", result.value.image);
                }

                await fetch(`${API_URL}/blogs/${blog.id}`, { method: "PUT", body: formData });
                fetchBlogs();
                Swal.fire("Updated!", "Blog has been updated.", "success");
            }
        });
    };

    // Handle Blog Deletion
    const deleteBlog = async (id) => {
        await fetch(`${API_URL}/blogs/${id}`, { method: "DELETE" });
        fetchBlogs();
    };

    return (
        
        <div className="container">
            <div className="blog-header">
              <h1>Blog Manager</h1>
              <button className="add-btn" onClick={openAddBlogForm}>Add Blog</button>
            </div>
           
            <div className="blog-container">
                {blogs.map((blog) => (
                    <div key={blog.id} className="blog-card">
                        <img src={blog.image ? `${API_URL}${blog.image}` : "https://via.placeholder.com/150"} alt="Blog" />
                        <div className="blog-content">
                            <h3>{blog.title}</h3>
                            <p>{blog.content}</p>
                            <p><strong>{blog.author}</strong> </p>
                            <button onClick={() => openEditBlogForm(blog)}>Edit</button>
                            <button className="delete-btn" onClick={() => deleteBlog(blog.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Blog;