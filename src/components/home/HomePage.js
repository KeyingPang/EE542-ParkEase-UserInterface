import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';


const textStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
    padding: '20px',
    borderRadius: '10px',
};

const buttonStyle = {
    margin: '5px',
};


function HomePage(props) {
    // const backgroundStyle = {
    //     backgroundImage: `url('/img/homepagebackground.jpg')`,
    //     backgroundSize: 'cover',
    //     backgroundPosition: 'center',
    //     backgroundRepeat: 'no-repeat', // Prevents repeating the background
    //     minHeight: '100vh', // Ensures at least the height of the viewport
    //     width: '100vw', // Ensures full viewport width coverage
    // };
    const backgroundStyle = {
        backgroundImage: `url('/img/homepagebackground.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute', // Use absolute positioning
        top: 20,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1, // Ensure it stays behind other content
    };
    
    

    return (

        <div style={backgroundStyle}> 
            <Container>
                <Row className="px-4 my-5">
                    <Col xs={4} sm={6}>
                        <Image
                            src="/img/logo.png"
                            fluid />
                    </Col>
                    <Col sm={6} style={textStyle}>
                        <h1 className="font-weight-light">Park Ease</h1>
                        <p className="mt-4">
                            Effortless Parking, Every Time
                            <br /><br />
                            Experience the ultimate in convenience and efficiency with Parking Ease, the smartest parking solution designed for the modern driver. 
                            Our state-of-the-art system seamlessly guides you to available parking spots, saving you time and reducing stress. With our intuitive app, you can reserve a space,
                            pay online, and even get notified when your parking time is almost up.
                        </p>
                        {
                            props.isAuthenticated === false && (
                                <>
                                    <Link
                                        to='/login'>
                                        <Button style={buttonStyle}  variant="outline-primary">Login &gt;&gt;</Button>
                                    </Link>
                                    &nbsp;&nbsp;
                                    <Link
                                        to='/register'>
                                        <Button style={buttonStyle}  variant="outline-primary">Register &gt;&gt;</Button>
                                    </Link>
                                </>
                            )
                        }
                        {
                            props.isAuthenticated !== false && (
                                <Link
                                    to='/contacts' state={{ authenticated: props.isAuthenticated }}>
                                    <Button style={buttonStyle} variant="outline-primary">View Parking Zone &gt;&gt;</Button>
                                </Link>
                            )
                        }
                    </Col>
                </Row>
            </Container >
        </div>
    )
}

export default HomePage;