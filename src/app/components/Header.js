"use client";

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';

const Header = () => {

    return (
        <header>
            <div className="d-flex flex-column flex-shrink-0 align-items-center py-5 h-100">
                <a href="/" className="d-flex align-items-center mb-4">
                    <span className="fs-4">
                        <img src="images/bg-logo.svg" alt="" width="32" height="32" className="" />
                    </span>
                </a>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <a href="#" className="nav-link active d-flex justify-content-center align-items-center" aria-current="page">
                            <img src="images/bd-portal-dashboard-icon.svg" alt="" width="24" height="24" className="" />
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link link-dark d-flex justify-content-center align-items-center">
                            <img src="images/bd-portal-pipeline-icon.svg" alt="" width="24" height="24" className="" />
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link link-dark d-flex justify-content-center align-items-center">
                            <img src="images/bd-portal-dam-icon.svg" alt="" width="24" height="24" className="" />
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link link-dark d-flex justify-content-center align-items-center">
                            <img src="images/bd-portal-org-icon.svg" alt="" width="24" height="24" className="" />
                        </a>
                    </li>
                </ul>
                <div className="dropdown mt-auto">
                    <a href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="images/avatar.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                    </a>
                    <ul className="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
                        <li><a className="dropdown-item" href="#">Action 1</a></li>
                        <li><a className="dropdown-item" href="#">Action 2</a></li>
                        <li><a className="dropdown-item" href="#">Action 3</a></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><a className="dropdown-item" href="#">Sign out</a></li>
                    </ul>
                </div>
            </div>
        </header>
    )
}

export default Header;