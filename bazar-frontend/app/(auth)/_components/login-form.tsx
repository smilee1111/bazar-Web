export default function LoginForm() {
    return (
        <div>
            <div className="mx-auto max-w-md p-4 border rounded">
                Login Header
                <div>
                    <label>Email</label>
                    <input type="email"/>
                </div>
                <div>
                    <label>Password</label>
                    <input type="password"/>
                </div>
            </div>
               
        </div>
    );
}


//create an url for blogs/[id]/edit - display Edit Blog Page
//create an url for blogs/delete - display Delete Blog Page
//create a register form component and apply it to register/page.tsx
//create a Link from register to Login page