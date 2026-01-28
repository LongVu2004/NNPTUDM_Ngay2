async function LoadData() {
    let res = await fetch("http://localhost:3000/posts");
    let posts = await res.json();
    let body = document.getElementById("body_table");
    body.innerHTML = '';
    
    for (const post of posts) {
        let isDeleted = post.isDeleted === true;
        
        let rowStyle = isDeleted ? 'style="text-decoration: line-through; color: gray;"' : '';
        let statusText = isDeleted ? '(Đã xoá)' : '';

        body.innerHTML += `<tr>
            <td ${rowStyle}>${post.id}</td>
            <td ${rowStyle}>${post.title} ${statusText}</td>
            <td ${rowStyle}>${post.views}</td>
            <td>
                <input type="submit" value="Delete" onclick="Delete('${post.id}')"/>
                <input type="submit" value="Edit" onclick="FillPostData('${post.id}', '${post.title}', '${post.views}')"/>
            </td>
        </tr>`;
    }
    LoadComments();
}

async function Save() {
    // 1. Lấy dữ liệu từ ô nhập
    let id = document.getElementById("id_txt").value.trim(); // Dùng trim() để cắt khoảng trắng thừa nếu có
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    // --- TRƯỜNG HỢP 1: Ô ID BỎ TRỐNG -> TẠO MỚI (AUTO INCREMENT) ---
    if (id === "") {
        try {
            // Bước 1: Lấy danh sách posts hiện tại về để tính ID
            let resGet = await fetch("http://localhost:3000/posts");
            let posts = await resGet.json();

            // Bước 2: Tìm ID lớn nhất (MaxID)
            let maxId = 0;
            for (const post of posts) {
                // Phải ép kiểu về số nguyên (parseInt) để so sánh đúng (vì trong DB là chuỗi)
                let currentId = parseInt(post.id);
                if (currentId > maxId) {
                    maxId = currentId;
                }
            }

            // Bước 3: Tạo ID mới = MaxID + 1 và chuyển thành chuỗi
            let newId = (maxId + 1).toString();

            // Bước 4: Gọi API POST để tạo mới
            let res = await fetch('http://localhost:3000/posts', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: newId,    // ID tự tăng
                    title: title,
                    views: views,
                    isDeleted: false // Mặc định chưa xoá
                })
            });

            if (res.ok) {
                console.log("Tạo mới thành công với ID: " + newId);
            }
        } catch (error) {
            console.log(error);
        }
    } 
    // --- TRƯỜNG HỢP 2: Ô ID CÓ GIÁ TRỊ -> SỬA (UPDATE) ---
    else {
        try {
            // Gọi API PUT vào đúng đường dẫn ID đó
            let res = await fetch('http://localhost:3000/posts/' + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    views: views,
                    isDeleted: false // Giữ trạng thái hiển thị
                })
            });

            if (res.ok) {
                console.log("Cập nhật thành công ID: " + id);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Reset ô nhập và tải lại bảng
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("view_txt").value = "";
    LoadData();
}

async function Delete(id) {
    let res = await fetch("http://localhost:3000/posts/" + id, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            isDeleted: true
        })
    });

    if (res.ok) {
        console.log("Đã xoá mềm thành công");
    }
    LoadData();
}

function FillPostData(id, title, views) {
    document.getElementById("id_txt").value = id;
    document.getElementById("title_txt").value = title;
    document.getElementById("view_txt").value = views;
}


// CRUD Comments
async function LoadComments() {
    let res = await fetch("http://localhost:3000/comments");
    let comments = await res.json();
    let body = document.getElementById("body_comments");
    body.innerHTML = '';
    
    for (const cmt of comments) {
        body.innerHTML += `<tr>
            <td>${cmt.id}</td>
            <td>${cmt.text}</td>
            <td>${cmt.postId}</td>
            <td>
                <button onclick="DeleteComment('${cmt.id}')">Delete</button>
                <button onclick="FillCommentData('${cmt.id}', '${cmt.text}', '${cmt.postId}')">Edit</button>
            </td>
        </tr>`;
    }
}

async function SaveComment() {
    let id = document.getElementById("cmt_id_txt").value;
    let text = document.getElementById("cmt_text_txt").value;
    let postId = document.getElementById("cmt_postid_txt").value;

    if (id === "") {
        let resGet = await fetch("http://localhost:3000/comments");
        let comments = await resGet.json();
        let maxId = 0;
        comments.forEach(c => {
            let currentId = parseInt(c.id);
            if (currentId > maxId) maxId = currentId;
        });
        let newId = (maxId + 1).toString();

        await fetch('http://localhost:3000/comments', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newId, text: text, postId: postId })
        });
    } else {
        await fetch('http://localhost:3000/comments/' + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text, postId: postId })
        });
    }

    document.getElementById("cmt_id_txt").value = "";
    document.getElementById("cmt_text_txt").value = "";
    document.getElementById("cmt_postid_txt").value = "";
    LoadComments();
}

async function DeleteComment(id) {
    if(confirm("Bạn có chắc muốn xoá cứng comment này?")) {
        await fetch("http://localhost:3000/comments/" + id, {
            method: 'DELETE'
        });
        LoadComments();
    }
}

function FillCommentData(id, text, postId) {
    document.getElementById("cmt_id_txt").value = id;
    document.getElementById("cmt_text_txt").value = text;
    document.getElementById("cmt_postid_txt").value = postId;
}

LoadData();