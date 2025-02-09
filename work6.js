const RB = ReactBootstrap;
const { Alert, Card, Button, Table } = ReactBootstrap;

class App extends React.Component {
    title = (
        <Alert variant="secondary">
            <b>Work6 :</b> Firebase
        </Alert>
    );
    footer = (
        <div>
            By 653380281-8 Waranya Hommuang <br />
            College of Computing, Khon Kaen University
        </div>
    );
    state = {
        scene: 0,
        students: [],
        stdid: "",
        stdtitle: "",
        stdfname: "",
        stdlname: "",
        stdemail: "",
        stdphone: "",
        user : null,
    }

    constructor(){
        super();
        firebase.auth().onAuthStateChanged((user)=>{
            if (user) {
              this.setState({user:user.toJSON()});
            }else{
              this.setState({user:null});
           }
        });    
    }


    google_login() {
        // Using a popup.
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        firebase.auth().signInWithPopup(provider);
    }


    google_logout(){
        if(confirm("Are you sure?")){
          firebase.auth().signOut();
        }
    }



    readData() {
        db.collection("students").get().then((querySnapshot) => {
            var stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            console.log(stdlist);
            this.setState({ students: stdlist });
        });
    }
    autoRead() {
        db.collection("students").onSnapshot((querySnapshot) => {
            var stdlist = [];
            querySnapshot.forEach((doc) => {
                stdlist.push({ id: doc.id, ...doc.data() });
            });
            this.setState({ students: stdlist });
        });
    }
    insertData() {
        if (!this.state.stdid) {
            alert("กรุณากรอกรหัสนักศึกษา!");
            return;
        }
    
        db.collection("students")
            .doc(this.state.stdid)
            .set({
                title: this.state.stdtitle || "",
                fname: this.state.stdfname || "",
                lname: this.state.stdlname || "",
                phone: this.state.stdphone || "",
                email: this.state.stdemail || "",
            })
            .then(() => {
                alert("บันทึกข้อมูลสำเร็จ!");
                this.setState({
                    stdid: "",
                    stdtitle: "",
                    stdfname: "",
                    stdlname: "",
                    stdemail: "",
                    stdphone: "",
                });
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล: ", error);
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล!");
            });
    }

    edit(std) {
        this.setState({
            stdid: std.id,
            stdtitle: std.title,
            stdfname: std.fname,
            stdlname: std.lname,
            stdemail: std.email,
            stdphone: std.phone,
        })
    }

    delete(std) {
        if (confirm("ต้องการลบข้อมูล")) {
            db.collection("students").doc(std.id).delete();
        }
    }

    render() {
        function StudentTable({ data, edit, deleteStudent }) {
            return (
                <table className="table table-bordered table-dark">
                    <thead>
                        <tr>
                            <th>รหัส</th>
                            <th>คำนำหน้า</th>
                            <th>ชื่อ</th>
                            <th>สกุล</th>
                            <th>Email</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((s) => (
                            <tr class="table-light" key={s.id}>
                                <td >{s.id}</td>
                                <td>{s.title}</td>
                                <td>{s.fname}</td>
                                <td>{s.lname}</td>
                                <td>{s.email}</td>
                                <td>
                                    <button onClick={() => edit(s)}>แก้ไข</button>
                                    <button onClick={() => deleteStudent(s)}>ลบ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        function TextInput({ label, app, value, style }) {
            return (
                <label className="form-label">
                    {label}:
                    <input
                        className="form-control"
                        style={style}
                        value={app.state[value]}
                        onChange={(ev) => {
                            app.setState(prevState => ({
                                ...prevState,
                                [value]: ev.target.value
                            }));
                        }}
                    />
                </label>
            );
        }
        
        function LoginBox(props) {
            const u = props.user;
            const app = props.app;
            if (!u) {
                return <div class="m-3"><Button variant="dark" onClick={() => app.google_login()}>Login</Button></div>
            } else {
                return <div class="m-3">
                    <img src={u.photoURL} />
                    {u.email}<Button className="ms-3" variant="danger" onClick={() => app.google_logout()}>Logout</Button></div>
            }
        }
        
          return (
            <Card>
                <Card.Header>{this.title}</Card.Header>
                <Card.Body>
                    <Button variant="dark" className="m-3" onClick={() => this.readData()}>Read Data</Button>
                    <Button variant="dark" onClick={() => this.autoRead()}>Auto Read</Button>
                    <div>
                        <StudentTable 
                            data={this.state.students} 
                            edit={(s) => this.edit(s)}
                            deleteStudent={(s) => this.delete(s)}
                        />
                    </div>
                </Card.Body>
                <Card.Footer>
                    <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b><br />
                    <TextInput label="ID" app={this} value="stdid" style={{ width: 120 }} />
                    <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={{ width: 100 }} />
                    <TextInput label="ชื่อ" app={this} value="stdfname" style={{ width: 120 }} />
                    <TextInput label="สกุล" app={this} value="stdlname" style={{ width: 120 }} />
                    <TextInput label="Email" app={this} value="stdemail" style={{ width: 150 }} />
                    <TextInput className="ms-2" label="Phone" app={this} value="stdphone" style={{ width: 120 }} />
                    <Button variant="dark" className="ms-3" onClick={() => this.insertData()}>Save</Button>
                </Card.Footer>
                <LoginBox user={this.state.user} app={this}></LoginBox>
                <Card.Footer>{this.footer}</Card.Footer>
            </Card>
        );
    }
}

const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);

const firebaseConfig = {
    apiKey: "AIzaSyBK3bUFp7WwbdP8dpC04YQDq6JeSKnBTzw",
    authDomain: "web2567-7e75c.firebaseapp.com",
    projectId: "web2567-7e75c",
    storageBucket: "web2567-7e75c.firebasestorage.app",
    messagingSenderId: "1055241395285",
    appId: "1:1055241395285:web:12a776f5c2b9fc27b508dc"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

root.render(<App />);
