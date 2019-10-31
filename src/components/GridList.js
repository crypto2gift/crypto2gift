import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import {tokenTileData, brandTileData} from './tileData';
import {GridListTileBar} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    root: {
        padding: 20,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        padding: 20,
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'space-around',
    },
    gridTile: {
        flexBasis: 250,
        //border: '1px solid #D8D8D8',
        //borderRadius: 4,
        '&:hover': {
            //border: "1px solid",
            //boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            //filter: 'brightness(175%)'
        }
    },
    img:{
        border: '1px solid #D8D8D8',
        '&:hover': {
            border: "3px solid #06268E",
        }
    }
}));


export const TokenGridList = ({balance, dispatch}) => {
    const classes = useStyles();
    const theme = useTheme();
    const xs = useMediaQuery(theme.breakpoints.down('xs'));
    const sm = useMediaQuery(theme.breakpoints.down('sm'));
    const md = useMediaQuery(theme.breakpoints.down('md'));
    const lg = useMediaQuery(theme.breakpoints.up('lg'));
    const getNbCols = () => {
        if(xs) return 1;
        if(sm) return 2;
        if(md) return 3;
        if(lg) return 4;
    };

    return (
        <div className={classes.root}>
            <GridList cellHeight={250} cellWidth={250} className={classes.gridList}  cols={getNbCols()} justify="center" spacing={20}>
                {tokenTileData.map(tile => (
                    <GridListTile key={tile.img} cols={tile.cols || 1} className={classes.gridTile} onClick={(e) => {
                        if(isNaN(parseFloat(balance[tile.title])) || parseFloat(balance[tile.title]) <= 0) return;
                        dispatch({type: 'symbol', symbol: tile.title});
                    }}>
                        <img src={tile.img} alt={tile.title} width={250} height={250} className={classes.img}/>
                        <GridListTileBar
                            title={tile.title}
                            subtitle={<span>balance: {balance[tile.title]}</span>}
                        />
                    </GridListTile>
                ))}
            </GridList>
        </div>
    );
};

export const BrandGridList = ({dispatch}) => {
    const classes = useStyles();
    const theme = useTheme();
    const xs = useMediaQuery(theme.breakpoints.down('xs'));
    const sm = useMediaQuery(theme.breakpoints.down('sm'));
    const md = useMediaQuery(theme.breakpoints.down('md'));
    const lg = useMediaQuery(theme.breakpoints.up('lg'));
    const getNbCols = () => {
        if(xs) return 1;
        if(sm) return 2;
        if(md) return 3;
        if(lg) return 4;
    };
    return (
        <div className={classes.root}>
            <GridList cellHeight={160} cellWidth={160} className={classes.gridList} cols={getNbCols()} justify="center" spacing={20}>
                {brandTileData.map(tile => (
                    <GridListTile key={tile.img} cols={tile.cols || 1} className={classes.gridTile} onClick={(e) => {
                        dispatch({type: 'brand', brand: tile.brand, title: tile.title});
                    }}>
                        <img src={tile.img} alt={tile.title} className={classes.img}/>
                    </GridListTile>
                ))}
            </GridList>
        </div>
    );
};