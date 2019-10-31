import React, {useContext, useEffect, useState, useReducer} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import {
    CryptContext,
    useCrypt2GiftCall
} from "../hooks/crypt2gift";
import {Web3Context} from "../hooks/ethers-hooks";
import {bigNumberToLink, token2Address} from "../utils/ethers-utils";
import {DappContext} from "../hooks/dapp";
import {BrandGridList} from "./GridList";
import {CRYPT2GIFT_ADDRESS} from "../contracts/data";
import {ethers} from "ethers";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Divider from '@material-ui/core/Divider';
import {CssBaseline, Typography} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop/Backdrop";
import Fade from "@material-ui/core/Fade";
import CheckIcon from "@material-ui/core/SvgIcon/SvgIcon";
import CircularProgress from "@material-ui/core/CircularProgress";
import {green} from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
    root: {
        padding: 20,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    },
    headerBalance: {
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
    },
    checkerContainer: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        height: 50
    },
    button: {
        height: 50
    },
    depositContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'

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
    checkIcon: {
        color: green[500],
        fontSize: 50
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }
}));

const giftReducer = (state, action) => {
  switch(action.type) {
      case "init":
          return {...initialState};
      case "requesting":
          return {...state, requesting: true, working: true};
      case "requested":
          return {...state, requested: true, working: true};
      case 'brand':
          return {...state, brand: action.brand, title: action.title};
      case 'claiming':
          return {...state, claiming: true, claimed: false};
      case 'claimed':
          return {...state, claiming: false, claimed: true};
      default:
          throw new Error(`Action ${action.type} not handled in giftReducer`);
  }
};

const initialState = {
    brand: '',
    requesting: false,
    requested: false,
    working: false,
    sendingEmail: false,
    emailSent: false,

};

export default function Gift() {
    const [state, dispatch] = useReducer(giftReducer, initialState);
    const [web3State, web3Dispatch] = useContext(Web3Context);
    const [cryptState, cryptDispatch] = useContext(CryptContext);
    const [dappState, dappDispatch] = useContext(DappContext);
    const classes = useStyles();
    const [canClaimState, canClaim] = useCrypt2GiftCall('canClaim');
    const [checkPriceState, checkPrice] = useCrypt2GiftCall('checkPrice');
    const [getLastPriceOfState, getLastPriceOf] = useCrypt2GiftCall('getLastPriceOf');
    const [claimGiftState, claimGift] = useCrypt2GiftCall('claimGift');
    const [claimReady, setClaimReady] = useState(false);
    const [lastPrice, setLastPrice] = useState(0);
    const [email, setEmail] = useState("");
    const [open, setOpen] = React.useState(false);
    const [openClaim, setOpenClaim] = React.useState(false);

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

    const handleOpenClaim = () => {
        setOpenClaim(true);
    };

    const handleCloseClaim = () => {
        setOpenClaim(false);
        dispatch({type: 'init'});
        cryptDispatch({type: 'init'});
        dappDispatch({type: 'step', step: 0});
    };

    useEffect(() => {
       if(state.claiming) {
           handleOpenClaim();
       }
    }, [state.claiming]);

    //Check if user has deposit else he shouldnot be there
    useEffect(() => {
        if(!cryptState.hasDeposit) {
            dappDispatch({type: 'step', step: 0});
        }
    }, [cryptState.hasDeposit, dappDispatch]);
    //Check if price is ready and if user can proceed
    useEffect(() => {
        (async () => {
            if(web3State.crypt2gift && cryptState.symbol.length > 0) {
                let claimBool = await canClaim();
                if (claimBool) {
                    setClaimReady(true);
                    let price = await getLastPriceOf(token2Address[cryptState.symbol]);
                    setLastPrice(price.toNumber());
                } else {
                    setClaimReady(false);
                    //await checkPrice(token2Address[cryptState.symbol])
                }
            }
        })();
    }, [web3State.crypt2gift, canClaim, checkPrice, cryptState.symbol, getLastPriceOf]);
    useEffect(() => {
        if(dappState.symbol.length > 0 && web3State.crypt2gift)  {
            let filter = web3State.crypt2gift.filters.PriceUp(dappState.symbol, null);
            const onPriceUp = (symbol, price) => {
                dappDispatch({type: 'isPriceReady', isPriceReady: 'true'});
                dappDispatch({type: 'price', price: price.toNumber()});
                setClaimReady(true);
                setLastPrice(price.toNumber());
                dispatch({type: 'requested'});
            };
            web3State.crypt2gift.on(filter, onPriceUp);
            return () => web3State.crypt2gift.removeListener('PriceUp', onPriceUp);
        }
    }, [web3State.crypt2gift, dappState.symbol, dappDispatch]);
    useEffect(() => {
        (async () => {
            if(state.requesting) {
                try {
                    await checkPrice(token2Address[cryptState.symbol]);
                }catch(e) {
                    dispatch({type: 'init'});
                    handleClose();
                }
            }
        })();
    }, [state.requesting, checkPrice, cryptState.symbol ]);
    //check if GiftClaimed is emited (it means that the backend received it too and trigger an email sending from gitfit)
    //event GiftClaimed(address indexed addr, string email, string brand, uint256 amount, uint decimal);
    useEffect(() => {
        if(dappState.symbol.length > 0 && web3State.crypt2gift)  {
            let filter = web3State.crypt2gift.filters.GiftClaimed(web3State.address, null, null, null, null);
            const onGiftClaimed = (addr, email, brand, amount, decimal) => {
                dispatch({type: 'claimed'});
            };
            web3State.crypt2gift.on(filter, onGiftClaimed);
            return () => web3State.crypt2gift.removeListener('GiftClaimed', onGiftClaimed);
        }
    }, [dispatch, web3State.crypt2gift, web3State.address, dappState.symbol]);
    return(
        <>
            <CssBaseline />
            <Container className={classes.headerBalance}>
                <Typography>
                    <div style={{color: "grey"}}>Deposited {dappState.symbol} balance</div>
                    <div>{cryptState.amount}</div>
                </Typography>
                <Typography>
                    <div style={{color: "grey"}}>Dollar balance</div>
                    {claimReady ? <div>${cryptState.amount * Number(lastPrice) / 100}</div>  : <div>{cryptState.symbol} price is not up to date</div>}
                </Typography>
                <Typography>
                    <div style={{color: "grey"}}>Current {cryptState.symbol} price</div>
                    {claimReady ? <div>${Number(lastPrice) / 100}</div> : <div>{cryptState.symbol} price is not up to date</div>}
                </Typography>
            </Container>
            <Divider />
            <div className={classes.root}>
            {claimReady ?
                (
                    <>
                        <BrandGridList dispatch={dispatch}/>
                        {state.brand.length > 0 && (
                            <>
                            <Typography>
                                You choose to claim for ${cryptState.amount * Number(lastPrice) / 100} of {state.title} eGift Card.
                            </Typography>
                        <Container className={classes.depositContainer}>
                        <TextField
                            id="outlined-adornment-amount"
                            variant="outlined"
                            label="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">@</InputAdornment>,
                                className: classes.input

                            }}
                        />
                        <Button type="button" className={classes.button} disabled={email.length < 0}
                                onClick={async () => {
                                    try {
                                        dispatch({type:'claiming'});
                                        await claimGift(email, state.brand);
                                    }catch(e) {

                                    }
                                }}
                        >Send my eGift Card</Button>
                        </Container>
                                </>
                        )}
                    </>
                )
                : ( <>
                        <div className={classes.checkerContainer}>
                            <Typography>
                                <p>
                                    The current price of {cryptState.symbol} is not up to date. Please check the current {cryptState.symbol} price.
                                </p>
                            </Typography>
                            <Button type="button" size="large"
                                onClick={() => {dispatch({type : 'requesting'})}}
                             >check {cryptState.symbol} Price</Button>
                        </div>
                    </>
                )
            }
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
                                {state.requesting && (
                                    <>
                                        <Typography>Requesting Chainlink oracles for the price of {dappState.symbol}</Typography>
                                        {state.requested ? <CheckIcon className={classes.checkIcon}/> : <CircularProgress />}
                                    </>)}
                            </div>
                            <div className={classes.status}>
                                {state.requested && (
                                    <>
                                        <Typography>Price of {cryptState.symbol} received from Chainlink node. 1 {dappState.symbol} = ${dappState.price / 100}</Typography>
                                        <CheckIcon className={classes.checkIcon}/>
                                    </>)}
                            </div>
                            <div className={classes.depositDone}>
                                {state.requested &&
                                (<>
                                    <div>
                                        <Button variant="contained" color="primary" type="button" size="large" className={classes.button}
                                                onClick={() => {
                                                    handleClose();
                                                    dispatch({type: 'init'});

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
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={openClaim}
                onClose={handleCloseClaim}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
                disableBackdropClick={true}
            >
                <Fade in={openClaim}>
                    <div className={classes.paper}>
                        <Container>
                            <div className={classes.status}>
                                {state.claiming && (
                                    <>
                                        <Typography>Sending your eGift Card</Typography>
                                        {state.claimed ? <CheckIcon className={classes.checkIcon}/> : <CircularProgress />}
                                    </>)}
                            </div>
                            <div className={classes.status}>
                                {state.claimed && (
                                    <>
                                        <Typography>Your eGift card has been sent to {email}. Please check your mailbox</Typography>
                                        <CheckIcon className={classes.checkIcon}/>
                                    </>)}
                            </div>
                            <div className={classes.depositDone}>
                                {state.claimed &&
                                (<>
                                    <div>
                                        <Button variant="contained" color="primary" type="button" size="large" className={classes.button}
                                                onClick={() => {
                                                    handleCloseClaim();
                                                }}
                                        >Back to Token selection</Button>
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
};