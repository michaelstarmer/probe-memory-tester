import React from "react";
import styled from "styled-components";
import { ReactComponent as IconLoader } from './loader.svg'

const Loader = styled.div`
    animation: spin 10s linear infinite;
    margin-bottom: .8rem;

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`

export const Spinner = () => <Loader>
        <IconLoader background="#fff" color="#fff" />
    </Loader>

export default Spinner;