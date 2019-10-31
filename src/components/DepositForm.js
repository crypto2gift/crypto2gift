import React, {useState, useEffect, useContext, useReducer} from 'react';
import {CryptContext, useCrypt2GiftCall, useLinkTokenCall} from "../hooks/crypt2gift";
import {DappContext} from "../hooks/dapp";
import {Web3Context} from "../hooks/ethers-hooks";
import {makeStyles, Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from '@material-ui/core/InputAdornment';
import Container from '@material-ui/core/Container';
import {bigNumberToLink, token2Address} from "../utils/ethers-utils";
import {CRYPT2GIFT_ADDRESS} from "../contracts/data";
import {ethers} from 'ethers';
import Divider from "@material-ui/core/Divider";
import CssBaseline from '@material-ui/core/CssBaseline';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import { green } from '@material-ui/core/colors';


const useStyles = makeStyles(theme => ({
    root: {
        padding: 20,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        overflow: 'hidden',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        height: '30vh'
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    },
    headerBalance : {
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        alignContent: 'flex-start'
    },
    depositContainer: {
        padding: 30,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    input: {
        height: 50,
        marginRight: 5
    },
    button: {
        height: 50,
        marginLeft: 5
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    status: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkIcon:{
        color: green[500],
        fontSize: 50
    },
    depositDone:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }
}));

const checkReducer = (state, action) => {
  switch(action.type) {
      case "init":
          return {...initialState};
      case "sending":
          return {...state, sending: true, working: true};
      case "sent":
          return {...state, sent: true, working: true};
      case "requesting":
          return {...state, requesting: true, working: true};
      case "requested":
          return {...state, requested: true, working: true};
      default:
          throw new Error(`action ${action.type} not handled in check reducer`);
  }
};

const initialState = {
    sending: false,
    sent: false,
    requesting: false,
    requested: false,
    working: false
};

export default function Deposit() {
    const [web3State, web3Dispatch] = useContext(Web3Context);
    const [cryptState, cryptDispatch] = useContext(CryptContext);
    const [dappState, dappDispatch] = useContext(DappContext);
    const classes = useStyles();
    const [state, dispatch] = useReducer(checkReducer, initialState);
    const [balanceOfState, balanceOf] = useCrypt2GiftCall("balanceOf");
    const [transferState, transferAndCall] = useLinkTokenCall("transferAndCall");
    const [depositAmount, setDepositAmount] = useState("0.0");
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if(state.working) {
            handleOpen();
        }
    }, [state.working]);
    //Find balance of user,
    useEffect(() => {
        (async () => {
            if(web3State.crypt2gift) {
                if(cryptState.hasDeposit) dappDispatch({type: 'balance', balance: cryptState.balance});
                else {
                    let curBalance = await balanceOf(token2Address[dappState.symbol]);
                    curBalance = bigNumberToLink(curBalance);
                    dappDispatch({type: 'balance', balance: curBalance});
                }
            }
        })();
    }, [web3State.crypt2gift, balanceOf, cryptState.balance, dappDispatch, cryptState.hasDeposit, dappState.symbol]);
    useEffect(() => {
        if(dappState.symbol.length > 0 && web3State.crypt2gift)  {
            let filter = web3State.crypt2gift.filters.TokenTransferred(web3State.address, token2Address[dappState.symbol], null, null);
            const onTokenTransferred = (address, ercAddress, amount, date) => {
                dispatch({type: 'sent'});
                cryptDispatch({type: 'hasDeposit', hasDeposit: true});
                dispatch({type: 'requesting'});
            };
            web3State.crypt2gift.on(filter, onTokenTransferred);
            return () => web3State.crypt2gift.removeListener('TokenTransferred', onTokenTransferred);
        }
    }, [dispatch, web3State.crypt2gift, dappState.symbol, web3State.address]);
    useEffect(() => {
        if(dappState.symbol.length > 0 && web3State.crypt2gift)  {
            let filter = web3State.crypt2gift.filters.PriceUp(dappState.symbol, null);
            const onPriceUp = (symbol, price) => {
                dappDispatch({type: 'isPriceReady', isPriceReady: 'true'});
                dappDispatch({type: 'price', price: price.toNumber()});
                dispatch({type: 'requested'});
            };
            web3State.crypt2gift.on(filter, onPriceUp);
            return () => web3State.crypt2gift.removeListener('PriceUp', onPriceUp);
        }
    }, [dispatch, web3State.crypt2gift, dappState.symbol, dappDispatch]);
    return(
        <>
        <CssBaseline />
            <Container className={classes.headerBalance}>
                <Typography>
                    <div style={{color: "grey"}}>Total {dappState.symbol} balance</div>
                    <div>{dappState.balance}</div>
                </Typography>
                <Typography>
                    <div style={{color: "grey"}}>Deposited {dappState.symbol} balance</div>
                    <div>{cryptState.amount}</div>
                </Typography>
            </Container>
            <Divider/>
            <div className={classes.root}>
            <Container className={classes.depositContainer}>
            <TextField
                id="outlined-adornment-amount"
                variant="outlined"
                label="Amount"
                value={depositAmount}
                onChange={(e) => {
                    setDepositAmount(e.target.value);
                }}
                InputProps={{
                    startAdornment: <InputAdornment position="start">{dappState.symbol}</InputAdornment>,
                    className: classes.input

                }}
            />
            <Button type="button" size="large" className={classes.button} disabled={dappState.balance < Number(depositAmount) || Number(depositAmount) <= 0}
            onClick={async () => {
                dispatch({type: 'sending'});
                try {
                    await transferAndCall(CRYPT2GIFT_ADDRESS, ethers.utils.parseEther(depositAmount.toString()), ethers.utils.formatBytes32String("wesh gros"));
                }catch(e) {
                    handleClose();
                    dispatch({type: 'init'});
                }
            }}
            >deposit</Button>
            </Container>
            </div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
                disableBackdropClick={true}
            >
                <Fade in={open}>
                    <div className={classes.paper}>
                        <Container>
                            <div className={classes.status}>
                                {state.sending && <Typography>sending {depositAmount} {dappState.symbol} to Crypto2Gift smart contract.</Typography>}{state.sent ? <CheckIcon className={classes.checkIcon}/> : <CircularProgress />}
                            </div>
                            <div className={classes.status}>
                            {state.sent && (
                                <>
                                    <Typography>{depositAmount} {dappState.symbol} received from {web3State.address}</Typography>
                                    <CheckIcon className={classes.checkIcon}/>
                                </>)}
                            </div>
                            <div className={classes.status}>
                            {state.requesting && (
                                <>
                                    <Typography>Requesting Chainlink oracles for the price of {dappState.symbol}</Typography>
                                    {state.requested ? <CheckIcon className={classes.checkIcon}/> : <CircularProgress />}
                                    </>)}
                            </div>
                            <div className={classes.status}>
                            {state.requested && (
                                <>
                                    <Typography>Price of {dappState.symbol} received from Chainlink node. 1 {dappState.symbol} = ${dappState.price / 100}</Typography>
                                    <CheckIcon className={classes.checkIcon}/>
                                </>)}
                            </div>
                            <div className={classes.depositDone}>
                                {state.requested &&
                                (<>
                                <div>
                                <Button type="button" size="small" className={classes.button}
                                        onClick={() => {
                                            handleClose();
                                            dispatch({type: 'init'});
                                            dappDispatch({type: 'step', step: dappState.step});
                                        }}
                                >Deposit More {dappState.symbol}</Button>
                                </div>
                                <div>
                                <Button type="button" size="small" className={classes.button}
                                        onClick={() => {
                                            handleClose();
                                            dispatch({type: 'init'});
                                            dappDispatch({type: 'step', step: dappState.step + 1});
                                        }}
                                >Claim your eGfit card</Button>
                                </div>
                                    </>)}
                            </div>
                            </Container>
                        <div>
                        </div>
                    </div>
                </Fade>
            </Modal>

        </>
    );
}