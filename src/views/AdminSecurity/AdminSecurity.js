import React, { useState, useEffect } from 'react';
import useStyles from '../../styles/AdminSecurity';
import { Paper, Avatar, Divider, Typography, List, ListItem, ListItemText, ListItemIcon, Button, Accordion, AccordionSummary, AccordionDetails, Chip, InputLabel, FormHelperText, FormControl, Select, MenuItem } from '@material-ui/core/';
import { ChevronLeft, ChevronRight, People, Mood, ExpandMore, Fingerprint, VerifiedUser, ReportProblemRounded, Add } from '@material-ui/icons/';
import { GetHistoryData, GetSecurityUserData, UpdateAuthMethods, DeleteMethod, setFace } from '../../api/user';
import Notification from '../../components/Notifications';
import Modal from '../../components/Modal';
import { useHistory } from 'react-router';
import { DropzoneArea } from 'material-ui-dropzone';
import * as Cons from "../../api/constants";
import clsx from 'clsx';

export default function AdminUserSecurity(props) {
    const history = useHistory();
    const [activeUser, setActiveUser] = useState("");
    const [userData, setUserData] = useState([{ isActive: true, name: "Facial" }, { isActive: true, name: "Huella" }])
    const [userList, setUserList] = useState([])
    const [isPromiseReady, setIsPromiseReady] = useState(false);
    const [isSecDataReady, setIsSecDataReady] = useState(false);
    const [noti, setNoti] = useState({ severity: "", open: false, description: "" })
    const [open, setOpen] = useState({ open: false });
    const [openAdd, setOpenAdd] = useState({ open: false, name: "" });
    const [openEdit, setOpenEdit] = useState({ open: false, data: "" });
    const [UsersPanel, setUsersPanel] = useState(true);
    const [fileInfo, setFileInfo] = useState({ isAdded: false });
    const [handData, setHandData] = useState("");
    const [fingerData, setFingerData] = useState({ value: "", array: [], fingers: ["Pulgar", "Indice", "Medio", "Anular", "Meñique"] });
    const classes = useStyles();


    useEffect(async () => {
        console.log(props.match.params);
        async function GetData(){
            if (userList.length === 0) {
                console.log(userList)
                let data = await GetHistoryData();
                if (data) {
                    setUserList(data.data.data);
                    console.log(userList);
                    console.log(data.data.data)
                    setIsPromiseReady(true);
                    console.log(isPromiseReady);
                } else {
                    history.push({
                        pathname: '/',
                        state: { expired: true }
                    });
                }
            } else {
                console.log("Datos del usuario")
                if (Object.keys(props.match.params).length > 0) {
                    const user = userList.filter(user => user.IDUser === props.match.params.id);
                    if (user.length > 0) {
                        setActiveUser(user[0].FullName);
                        console.log(userList)
                        fetchUserSecurity(user[0].FullName, user[0].IDUser)
                    }
                    console.log(user)
                }
            }
        }
        GetData()
    }, [userList])

    function handleClick() {
        setUsersPanel(!UsersPanel)
    }

    function Toggle(name) {
        name = name.toLowerCase();
        let Update = JSON.parse(JSON.stringify(userData))
        console.log(Update);
        Update[name][0].IsActive = Number(!Update[name][0].IsActive)
        let testDict = []
        for (let key in Update) {
            console.log(key)
            if (key !== "email" && key !== "isActive" && key !== "IDUser" && Update[key][0] !== undefined) testDict.push(Update[key][0])
        }
        console.log(testDict)
        const IsToUpdate = testDict.some(el => el.IsActive && el.Name !== "Codigo")
        if (IsToUpdate) {
            const params = {
                id: Update[name][0].IDSecurity,
                active: Update[name][0].IsActive
            }
            const res = UpdateAuthMethods(params)
            if (!res) {
                history.push({
                    pathname: '/',
                    state: { expired: true }
                });
            } else setUserData(Update)
        } else {
            console.log("asdasdasd")
            setNoti({
                severity: "warning",
                description: "No puedes desactivar el último metodo de autenticacion activo",
                open: true
            })

        }
    }

    const handleClickOpen = (id, IDUser) => {
        setOpen({ open: true, id, IDUser });
    };

    const handleClose = () => {
        setOpen({ open: false });
    };

    async function handleConfirmDelete() {
        console.log(open)
        let data = await DeleteMethod(open.id);
        console.log(data)
        if (data) {
            setOpen({ open: false });
            setNoti({
                severity: "success",
                description: "Se ha eliminado la imagen satisfactoriamente",
                open: true
            })
            fetchUserSecurity(activeUser, open.IDUser)
        } else {
            history.push({
                pathname: '/',
                state: { expired: true }
            });
        }
    };

    function handleClickOpenAdd(name) {
        setOpenAdd({ open: true, name });
    }

    function handleCloseAdd() {
        setOpenAdd({ open: false, name: "" })
        setFileInfo({ isAdded: false })
        setHandData("")
    }

    async function handleAddUpload() {
        const params = {
            face: fileInfo.fileObjs[0],
            id: userData.IDUser
        }
        console.log(params);
        const res = await setFace(params)
        console.log(res);
        if (res) {
            if (res.data.success) {
                setOpenAdd({ open: false, name: "" });
                setNoti({
                    severity: "success",
                    description: "Se ha agregado la imagen satisfactoriamente",
                    open: true
                })
                fetchUserSecurity(activeUser, userData.IDUser);
            } else {
                setNoti({
                    severity: "error",
                    description: "Ha ocurrido un error, inténtelo nuevamente",
                    open: true
                })
            }
        } else {
            history.push({
                pathname: '/',
                state: { expired: true }
            });
        }
    }

    function handleAddTakePhoto() {

    }

    useEffect(() => {
        if (handData) {
            console.log(userData)
            setFingerData({
                ...fingerData, array: userData.huella.filter((item) => {
                    return !item.fingerName.includes(handData)
                })
            })
        }
    }, [handData])

    function handleHand(e) {
        setHandData(e.target.value)
    }

    function handleFinger(e) {
        setFingerData({ ...fingerData, value: e.target.value })
    }

    async function fetchUserSecurity(name, id) {
        console.log(id);
        console.log(name)
        let data = await GetSecurityUserData(id);
        let d = ""
        const email = userList.filter(user => user.IDUser === id)[0].Email;
        const isActive = userList.filter(user => user.IDUser === id)[0].IsActive;
        const IDUser = userList.filter(user => user.IDUser === id)[0].IDUser;
        console.log(email, isActive)
        if (data) {
            if (data.data.data.length > 0) {
                console.log(data.data.data);
                const codigo = data.data.data.filter((d) => d.Name === "Codigo")
                const huella = data.data.data.filter((d) => d.Name === "Huella")
                const facial = data.data.data.filter((d) => d.Name === "Facial")
                d = { IDUser, isActive, email, codigo, huella, facial }
                console.log(d);
                if (huella.length === 0 && facial.length === 0) {
                    setNoti({
                        ...noti, severity: "warning",
                        description: "No hay métodos de autenticación configurados",
                        open: true
                    })
                }
            } else {
                d = {}
                console.log(d);
                setNoti({
                    ...noti, severity: "warning",
                    description: "No hay información del usuario para mostrar",
                    open: true
                })
            }
            setActiveUser(name);
            setUserData(d);
            setIsSecDataReady(true);
        } else {
            history.push({
                pathname: '/',
                state: { expired: true }
            });
        }
    }

    const handleClickOpenEdit = (data) => {
        setOpenEdit({ open: true, data });
    };

    function handleEditUpload() {

    }

    function handleCloseEdit() {
        setOpenEdit({ open: false, data: "" })
    }

    function handleEditTakePhoto() {

    }

    return (
        <div className={classes.root}>
            {(noti.open) ? <Notification close={setNoti} data={noti} /> : ""}
            <Paper elevation={2} className={classes.mainContainer}>
                <Modal IsOpen={open.open} close={handleClose} okFunction={handleConfirmDelete} title="Desea eliminar la foto?">
                    <Typography align="center" style={{ marginTop: "1em" }}>Esta acción no se podrá deshacer.</Typography>
                </Modal>
                <Modal defaultButtons={false} IsOpen={openAdd.open} close={handleCloseAdd} uploadPhotoFunction={handleAddUpload} takePhotoFunction={handleAddTakePhoto} disableUploadPhoto={!fileInfo.isAdded} title={openAdd.name === "Huella" ? "Agregar Dedo" : "Agregar imagen facial"}>
                    {openAdd.name === "Huella" ? (
                        <div >
                            <DropzoneArea filesLimit={1} dropzoneText="Arrastra un archivo o haz click para seleccionar un archivo" showAlerts={false} acceptedFiles={['image/*']} onAdd={(fileObjs) => setFileInfo({ isAdded: true })} onDrop={(fileObjs) => setFileInfo({ isAdded: true })}
                                onDelete={(fileObjs) => setFileInfo({ isAdded: false })} />
                            <div style={{ display: "flex" }}>
                                <FormControl required className={classes.formControl}>
                                    <InputLabel htmlFor="hand-native-required">Mano</InputLabel>
                                    <Select
                                        value={handData}
                                        onChange={handleHand}
                                        name="hand"
                                        inputProps={{
                                            id: 'hand-native-required',
                                        }}
                                    >
                                        <MenuItem disabled value="">
                                            <em>Seleccionar</em>
                                        </MenuItem>
                                        <MenuItem value={"derecho"}>Derecha</MenuItem>
                                        <MenuItem value={"izquierdo"}>Izquierda</MenuItem>
                                    </Select>
                                    <FormHelperText>Obligatorio</FormHelperText>
                                </FormControl>
                                <FormControl required className={classes.formControl}>
                                    <InputLabel htmlFor="finger-native-required">Dedo</InputLabel>
                                    <Select
                                        value={fingerData.value}
                                        onChange={handleFinger}
                                        name="finger"
                                        inputProps={{
                                            id: 'finger-native-required',
                                        }}
                                    >
                                        {fingerData.array ? fingerData.fingers.map((finger, idx) => {
                                            for (let i of fingerData.array) {
                                                console.log(i)
                                                console.log(handData)
                                                if (i.fingerName.includes(finger)) {
                                                    return <MenuItem disabled key={idx} value={finger}>{finger}</MenuItem>
                                                }
                                            }
                                            return <MenuItem key={idx} value={finger}>{finger}</MenuItem>
                                        }) : ""}
                                    </Select>
                                    <FormHelperText>Obligatorio</FormHelperText>
                                </FormControl>
                            </div>
                        </div>
                    ) : openAdd.name === "Facial" ? (
                        <div>
                            <Typography align="center">Ingrese la nueva foto facial </Typography>
                            <DropzoneArea filesLimit={1} dropzoneText="Arrastra un archivo o haz click para seleccionar un archivo" showAlerts={false} acceptedFiles={['image/*']} onAdd={(fileObjs) => setFileInfo({ fileObjs, isAdded: true })} onDrop={(fileObjs) => setFileInfo({ fileObjs, isAdded: true })}
                                onDelete={() => setFileInfo({ isAdded: false })} />
                        </div>
                    ) : (null)}

                </Modal>
                <Modal defaultButtons={false} IsOpen={openEdit.open} close={handleCloseEdit} uploadPhotoFunction={handleEditUpload} takePhotoFunction={handleEditTakePhoto} disableUploadPhoto={!fileInfo.isAdded} title="Editar">
                    {openEdit.data.Name === "Huella" ? (
                        <div>
                            <Typography align="center">Dedo {openEdit.data.fingerName}</Typography>
                            <DropzoneArea filesLimit={1} dropzoneText="Arrastra un archivo o haz click para seleccionar un archivo" showAlerts={false} acceptedFiles={['image/*']} onAdd={(fileObjs) => setFileInfo({ isAdded: true })} onDrop={(fileObjs) => setFileInfo({ isAdded: true })}
                                onDelete={(fileObjs) => setFileInfo({ isAdded: false })} />
                        </div>
                    ) : openEdit.data.Name === "Facial" ? (
                        <div>
                            <Typography align="center">Ingrese la nueva foto facial </Typography>
                            <DropzoneArea filesLimit={1} dropzoneText="Arrastra un archivo o haz click para seleccionar un archivo" showAlerts={false} acceptedFiles={['image/*']} onAdd={(fileObjs) => setFileInfo({ isAdded: true })} onDrop={(fileObjs) => setFileInfo({ isAdded: true })}
                                onDelete={(fileObjs) => setFileInfo({ isAdded: false })} />
                        </div>
                    ) : (null)}

                </Modal>
                <div className={classes.panelContainer}>
                    <Paper className={clsx(UsersPanel ? classes.UserList : classes.UserListMinimized)}>
                        {UsersPanel ?
                            <div className="container">
                                <Typography align="center" className="Title">Usuarios</Typography>
                                <Divider variant="middle" className="divider" />
                                <div className="lists">
                                    <Accordion className="acordion">
                                        <AccordionSummary
                                            expandIcon={<ExpandMore />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography className={classes.heading}>Usuarios</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <List className={classes.List}>
                                                {isPromiseReady ? userList.map((data, index) => {
                                                    if (!data.IsAdmin) {
                                                        return (
                                                            <List component="nav" aria-label="main mailbox folders" key={index} >
                                                                <ListItem button key={index} onClick={() => { fetchUserSecurity(data.FullName, data.IDUser) }} id={data.IDUser}>
                                                                    <ListItemIcon>
                                                                        <People />
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={data.FullName} />
                                                                </ListItem>
                                                            </List>
                                                            /*
                                                            <ListItem button key={index} onClick={() => {fetchUserSecurity(data.FullName, data.IDUser)}} className={clsx(classes.ListItem, activeUser === data.FullName ? classes.active : "")}>
                                                                <ListItemText primary={data.FullName} classes={{ primary: classes.listItemText }}/>
                                                            </ListItem>*/
                                                        )
                                                    }
                                                }) : "cargando"}
                                            </List>
                                        </AccordionDetails>
                                    </Accordion>
                                    <Accordion className="acordion">
                                        <AccordionSummary
                                            expandIcon={<ExpandMore />}
                                            aria-controls="panel2a-content"
                                            id="panel2a-header"
                                        >
                                            <Typography className={classes.heading}>Administradores</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <List className={classes.List}>
                                                {isPromiseReady ? userList.map((data, index) => {
                                                    if (data.IsAdmin) {
                                                        return (
                                                            <List component="nav" aria-label="main mailbox folders" key={index}>
                                                                <ListItem button key={index} onClick={() => { fetchUserSecurity(data.FullName, data.IDUser) }} id={data.IDUser}>
                                                                    <ListItemIcon>
                                                                        <VerifiedUser />
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={data.FullName} />
                                                                </ListItem>
                                                            </List>
                                                            /*
                                                            <ListItem button key={index} onClick={() => {fetchUserSecurity(data.FullName, data.IDUser)}} className={clsx(classes.ListItem, activeUser === data.FullName ? classes.active : "")}>
                                                                <ListItemText primary={data.FullName} classes={{ primary: classes.listItemText }}/>
                                                            </ListItem>*/
                                                        )
                                                    }
                                                }) : "cargando"}
                                            </List>
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                            </div>
                            :
                            <People />
                        }
                    </Paper>
                    <Button className={classes.minimizerButton} onClick={handleClick}>
                        {UsersPanel ? <ChevronLeft className="icon" /> : <ChevronRight className="icon" />}
                    </Button>
                    {(isSecDataReady && Object.keys(userData).length != 0) ? (
                        <Paper elevation={0} className={classes.dataContainer}>
                            <div className={classes.UpperContainer}>
                                <Typography className="name">{activeUser}</Typography>
                                <Typography className="code">{userData.codigo[0].data}</Typography>
                                <Typography className="EmailType">{userData.email}-{userData.isActive ? "Activo" : "Inactivo"}</Typography>
                            </div>
                            <Divider variant="middle" />
                            <div className={classes.BottomContainer}>
                                {userData.facial.length !== 0 ? (
                                    <Paper elevation={2} className={classes.LeftContainer}>
                                        <Typography variant="h5" className={classes.photoTitle}>
                                            Foto para reconocimiento facial
                                        </Typography>

                                        <Avatar className={classes.faceAvatar} src={`${Cons.url}${userData.facial[0].data}`} />
                                        <div className={classes.photoButtonGroup}>
                                            {/*<Button variant="contained" className={clsx([classes.button, classes.editButton])} onClick={() => handleClickOpenEdit(userData.facial[0])}>
                                                Editar
                                            </Button>*/}
                                            <Button variant="contained" className={clsx([classes.button, classes.deleteButton])} onClick={() => handleClickOpen(userData.facial[0].IDBiometrics, userData.IDUser)}>
                                                Eliminar
                                            </Button>
                                        </div>
                                        <Paper onClick={() => Toggle(userData.facial[0].Name)} key={userData.facial[0].Name}
                                            className={clsx(classes.AuthItem, userData.facial[0].IsActive && classes.disabled, userData.facial[0].IsActive ? classes.green : classes.red)} elevation={1}>
                                            <Paper className="AuthName" elevation={0}>
                                                <Mood />
                                                <Typography>
                                                    {userData.facial[0].Name}
                                                </Typography>
                                            </Paper>
                                            <Typography className="IsActive">
                                                {userData.facial[0].IsActive ? "Activo" : "Inactivo"}
                                            </Typography>
                                        </Paper>
                                    </Paper>
                                ) : (
                                    <Paper elevation={2} className={clsx(classes.LeftContainer, classes.noPhoto)}>
                                        <Typography variant="h5" className={classes.photoTitle}>
                                            Foto para reconocimiento facial
                                        </Typography>
                                        <div className={classes.noPhotoContent}>
                                            <Chip
                                                className={classes.chip}
                                                icon={<ReportProblemRounded />}
                                                label="No hay foto configurada"
                                            />
                                            <Button variant="contained" className={clsx([classes.button, classes.editButton])} onClick={() => handleClickOpenAdd("Facial")}>
                                                <Add />
                                                    Agregar foto
                                            </Button>
                                        </div>
                                    </Paper>
                                )}

                                {userData.huella.length !== 0 ? (
                                    <Paper elevation={2} className={classes.RightContainer}>
                                        <Typography variant="h5" className={classes.fingerTitle}>
                                            Huellas dactilares
                                        </Typography>
                                        <Divider orientation="horizontal" variant={"middle"} style={{ width: "95%" }} />
                                        <div className={classes.fingerInfoContainer}>
                                            {userData.huella.map((data, index) => {
                                                return (
                                                    <div key={data.IDBiometrics} className={classes.fingerDataContainer}>
                                                        <div className={classes.fingerContainer2}>
                                                            <Avatar className={classes.fingerAvatar}>
                                                                <Fingerprint style={{ width: "50%", height: "50%" }} />
                                                            </Avatar>
                                                            <div className={classes.fingerItem}>
                                                                <div className={classes.fingerItemTitleContainer}>
                                                                    <Typography variant="h5" className={classes.fingerItemTitle}>
                                                                        Dedo {data.fingerName}
                                                                    </Typography>
                                                                </div>

                                                                <div className={classes.fingerItemButtonGroup}>
                                                                    {/*<Button variant="contained" className={clsx([classes.button, classes.editButton])} style={{margin: "0.3em 0"}} onClick={() => handleClickOpenEdit(data)}>
                                                                            Editar
                                                                        </Button>*/}
                                                                    <Button variant="contained" className={clsx([classes.button, classes.deleteButton])} onClick={() => handleClickOpen(data.IDBiometrics, userData.IDUser)}>
                                                                        Eliminar
                                                                        </Button>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        <Divider orientation="horizontal" variant={"middle"} style={{ width: "80%" }} />
                                                        {(userData.huella.length === (index + 1)) ? (
                                                            <Button variant="contained" className={clsx([classes.button, classes.editButton])} onClick={handleClickOpenAdd} style={{ margin: "1em 0" }} onClick={() => handleClickOpenAdd("Huella")}>
                                                                <Add />
                                                                Agregar foto
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div style={{ width: "100%" }}>
                                            <Divider orientation="horizontal" variant={"middle"} />
                                            <Paper onClick={() => Toggle(userData.huella[0].Name)} key={userData.huella[0].Name} className={clsx(classes.AuthItem, userData.huella[0].IsActive && classes.disabled, userData.huella[0].IsActive ? classes.green : classes.red)} elevation={1} style={{ margin: "1em auto" }}>
                                                <Paper className="AuthName" elevation={0}>
                                                    <Fingerprint />
                                                    <Typography>
                                                        {userData.huella[0].Name}
                                                    </Typography>
                                                </Paper>
                                                <Typography className="IsActive">
                                                    {userData.huella[0].IsActive ? "Activo" : "Inactivo"}
                                                </Typography>
                                            </Paper>
                                        </div>
                                    </Paper>
                                )
                                    : (
                                        <Paper elevation={2} className={clsx(classes.RightContainer, classes.noPhoto)}>
                                            <Typography variant="h5" className={classes.fingerTitle}>
                                                Huellas dactilares
                                            </Typography>
                                            <Divider orientation="horizontal" variant={"middle"} style={{ width: "95%" }} />
                                            <div className={classes.noPhotoContent}>
                                                <Chip
                                                    className={clsx(classes.chip)}
                                                    icon={<ReportProblemRounded />}
                                                    label="No hay huellas dactilares configuradas"
                                                />
                                                <Button variant="contained" className={clsx([classes.button, classes.editButton])} onClick={handleClickOpenAdd}>
                                                    <Add />
                                                        Agregar foto
                                                </Button>
                                            </div>
                                        </Paper>
                                    )
                                }
                            </div>
                        </Paper>
                    ) :
                        <Typography className={classes.noInfoText}>
                            Seleccione un usuario para visualizar su información
                    </Typography>
                    }
                </div>
            </Paper>
        </div>
    )
}