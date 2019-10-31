import React, {useContext} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import PropTypes from 'prop-types';
import Currency from "./components/CurrencyForm";
import Deposit from "./components/DepositForm";
import Gift from "./components/GiftForm";
import {DappContext} from "./hooks/dapp";
import {pink} from '@material-ui/core/colors';
import {indigo} from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import logo from './images/logo/vector/default-monochrome-white.svg';
import {CryptContext} from "./hooks/crypt2gift";



const theme = createMuiTheme({
    palette: {
        primary: {
            //main: '#410FF8'
            main: '#06268E'
        },
        secondary: {
            main: '#1bbc9e'
        } // Indigo is probably a good match with pink
    },
    overrides: {
        MuiButton: {
            root: {
                color: 'white',
                backgroundColor: '#06268E',
                '&:hover': {
                    backgroundColor: '#1bbc9e'
                },
                '&:disabled': {
                    color: 'white',
                    backgroundColor: 'grey'
                }
            },
        }
    }
});

const useStyles = makeStyles(theme => ({
    appBar: {
        position: 'relative',
        //background: 'transparent',
        //boxShadow: '0px 12px 0px -10px rgba(9,211,172,1)'
    },
    logo: {
        maxHeight: 100,
        maxWidth: 100,

    },
    layout: {
        width: 'auto',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
            width: "80%",
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
            marginTop: theme.spacing(6),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3),
        },
    },
    stepper: {
        padding: theme.spacing(3, 0, 5),
    },
    buttons: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    button: {
        marginTop: theme.spacing(3),
        marginLeft: theme.spacing(1),
    },
}));
const steps = ['Choose a Token', 'Deposit', 'Claim eGift Cards'];

function getStepContent(step) {
    switch (step) {
        case 0:
            return <Currency />;
        case 1:
            return <Deposit />;
        case 2:
            return <Gift />;
        default:
            throw new Error('Unknown step');
    }
}


export default function Dapp () {
    const [dappState, dappDispatch] = useContext(DappContext);
    const [cryptState, cryptDispatch] = useContext(CryptContext);
    const classes = useStyles();
    const handleNext = () => {
        dappDispatch({type: "step", step: dappState.step + 1});
    };
    const handleBack = () => {
        dappDispatch({type: "step", step: dappState.step - 1});
    };
    return(
      <>
          <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="relative" color="primary" className={classes.appBar}>
              <Toolbar>
                  <img src={logo} alt="Crypto2Gift" className={classes.logo} />
              </Toolbar>
          </AppBar>
          <main className={classes.layout}>
              <Paper className={classes.paper}>
                  <Typography component="h1" variant="h4" align="center">
                      Trade your tokens for eGift Cards
                  </Typography>
                  <Stepper alternativeLabel activeStep={dappState.step} className={classes.stepper}>
                      {steps.map(label => (
                          <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                          </Step>
                      ))}
                  </Stepper>
                  <React.Fragment>
                              {getStepContent(dappState.step)}
                              <div className={classes.buttons}>
                                  {dappState.step === 1 && (
                                      <>
                                      <Button onClick={handleBack} className={classes.button} disabled={cryptState.hasDeposit}>
                                          Back to token selection
                                      </Button>
                                      <Button onClick={handleNext} className={classes.button} disabled={!cryptState.hasDeposit}>
                                          go to eGift selection
                                      </Button>
                                      </>

                                  )}
                                  {dappState.step === 2 &&
                                      <Button
                                          onClick={handleBack}
                                          className={classes.button}
                                      >
                                          Deposit more {dappState.symbol}
                                      </Button>
                                  }
                              </div>
                  </React.Fragment>
              </Paper>
          </main>
          </MuiThemeProvider>
      </>
    );
};
