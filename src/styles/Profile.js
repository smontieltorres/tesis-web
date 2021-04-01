import { makeStyles} from '@material-ui/core/styles';
import sizes from "./sizes";

let useStyles = "";

export default useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      '& > *': {
        boxShadow: "3px 3px 4px 1px #00000052"
      },
          "& GraphBox" :{
          },
      justifyContent: "center",
    },
    avatar: {
        height: "100%",
        minWidth: "5vmax",
        minHeight: "5vmax",
        width: "100%",
        overflow: "visible",
        boxShadow: "2px 2px 3px rgba(0,0,0,0.45)",
    },
    username: {
        display: 'flex',
        position: "relative",
        top: "-1vmax",
        width: "100%",
        height: "4vmin",
        borderRadius: "40px",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "3px 3px 4px 1px #00000052"
    },
    GraphBox: {
        width: "95vmax",
        height: "60vh",
        alignSelf: "center",
        [sizes.Wdown("sm")]:{
            width: "90vmax",
        },
    },
    container:{
        display: "flex",
        position: "relative", 
        height: "15vmin",
        top: "-3vh",
        boxShadow: "none",
        textAlign: "-webkit-center",
        margin: theme.spacing(2),
    },
    container_avatar:{
        width: "20vmin", 
        margin: "0",
        boxShadow: "none",
    },
    container_buttons:{
        margin: theme.spacing(2),
        position: "relative",
        width: "50%",
        top: "2.5vh",
        left: "12.5vw",
        boxShadow: "none"
    },
    button_Edit: {
        background: "white",
        width: "50%",
        height: "50%",
        borderRadius: "40px",
        boxShadow: "3px 3px 4px 1px #00000052"
    },
    button_idk: {
        background: "white",
        width: "50%",
        height: "50%",
        position: "relative",
        left: "10vw",
        borderRadius: "40px",
        boxShadow: "3px 3px 4px 1px #00000052"
    },
    typography: {
        fontWeight: 600,
        fontSize: "1vmax",
    },
  }));