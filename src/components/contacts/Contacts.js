import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';

import { v4 as uuid } from 'uuid';
import { listContacts } from '../../graphql/queries';
import { createContact } from '../../graphql/mutations';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal  from 'react-bootstrap/Modal';
import axios from 'axios'; // If using Axios
// No import needed for Fetch as it's a browser API

import { InputGroup, FormControl} from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';




// AWS.config.update({
//   accessKeyId: 'YOUR_ACCESS_KEY_ID',
//   secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
//   region: 'YOUR_REGION'
// });



// const AWS = require('aws-sdk');

function Contacts(props) {

    const navigate = useNavigate()

    const [contacts, setContacts] = useState([]);
    // const [contactInfo, setcontactInfo] = useState({ name: "", email: "", cell: "" });
    const [contactInfo, setContactInfo] = useState({ name: "", carPlateNumber: ""});
    const [profilePic, setProfilePic] = useState("");
    const [profilePicPaths, setProfilePicPaths] = useState([]);
    const [plateNumber, setPlateNumber] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    // Added
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ plateNumber: '', zoneNum: '' });
    const [showNotFoundModal, setShowNotFoundModal] = useState(false);

    const [showSpotModal, setShowSpotModal] = useState(false);
    const [modalSpotData, setModalSpotData] = useState({  emptySpot: '' });
    const [showSpotNotFoundModal, setShowSpotNotFoundModal] = useState(false);
    
    // const [result, setResult] = useState(null);
    // const [isLoading, setIsLoading] = useState(false);

    // const findEmptySpot = async () => {
    //     setIsLoading(true);
    //     try {
    //       // Replace with your actual API endpoint
          
    //       const response = await axios.get('https://your-api-endpoint.com/path');
    //       setResult(response.data); // Process the response as needed
    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //       // Handle error appropriately
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };

    // Function to find an empty spot and trigger a popup with its ID
    const fetchSpotData = async () => {
        try {
            // const response = await Storage.get('latest_combined_file.json', { download: true });
            const response = await Storage.get('spotTest.json', { download: true });
            const blob = response.Body;
            const text = await new Response(blob).text();
            const jsonData = JSON.parse(text);

            // Log the JSON data to the console
            console.log("Fetched JSON data:", jsonData);
            return JSON.parse(text);
        } catch (error) {
            console.error('Error fetching zone data from S3', error);
            return null;
        }
    }



    const fetchZoneData = async () => {
        try {
            const response = await Storage.get('test.json', { download: true });
            const blob = response.Body;
            const text = await new Response(blob).text();
            const jsonData = JSON.parse(text);

            // Log the JSON data to the console
            console.log("Fetched JSON data:", jsonData);
            return JSON.parse(text);
        } catch (error) {
            console.error('Error fetching zone data from S3', error);
            return null;
        }
    };
    
    const handleSpotSearch = async (e) => {
        e.preventDefault();
        try {
            const spotData = await fetchSpotData();
            console.log('fetch success')
            const matchingEntry = spotData.find(entry => entry.data === "empty");
            console.log(spotData)
            if (matchingEntry) {
                // Display the ZoneNum on the frontend
                console.log(`empty spot::`, matchingEntry.id);
                // Update the state or handle the display as needed
                setModalSpotData({ emptySpot: matchingEntry.id });
                setShowSpotModal(true);
            } else {
                // Handle the case where the plate number is not found
                console.log('No empty spot');
                setShowSpotNotFoundModal(true);
            }
        } catch (error) {
            console.error('Error in search', error);
        }
    };


    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const zoneData = await fetchZoneData();
            console.log('fetch success')
            const matchingEntry = zoneData.find(entry => entry.CarPlateNumber === plateNumber);
            console.log(zoneData)
            console.log(plateNumber)
            if (matchingEntry) {
                // Display the ZoneNum on the frontend
                console.log(`Zone Number for ${plateNumber}:`, matchingEntry.ZoneNum);
                // Update the state or handle the display as needed
                //Added
                setModalData({ plateNumber: matchingEntry.CarPlateNumber, zoneNum: matchingEntry.ZoneNum });
                setShowModal(true);
            } else {
                // Handle the case where the plate number is not found
                console.log('Plate number not found in zone data');
                setShowNotFoundModal(true);
            }
        } catch (error) {
            console.error('Error in search', error);
        }
    };


    const handleCloseNotFoundModal = () => setShowNotFoundModal(false);
    //Added
    const handleCloseModal = () => setShowModal(false);

    const handleSpotCloseNotFoundModal = () => setShowSpotNotFoundModal(false);
    //Added
    const handleSpotCloseModal = () => setShowSpotModal(false);

    const getContacts = async() => {
        try {
            const contactsData = await API.graphql(graphqlOperation(listContacts));
            console.log(contactsData);

            const contactsList = contactsData.data.listContacts.items;
            setContacts(contactsList);

            contacts.map(async (contact, indx) => {
                const contactProfilePicPath = contacts[indx].profilePicPath;
                try {
                    const contactProfilePicPathURI = await Storage.get(contactProfilePicPath, {expires: 60});
                    setProfilePicPaths([...profilePicPaths, contactProfilePicPathURI]);
                } catch(err) {
                    console.log('error', err);
                }
            });
        } catch(err) {
            console.log('error', err);
        }
    }


    const addNewContact = async () => {
        try {
            const { name, carPlateNumber} = contactInfo;

            // Upload pic to S3
            Storage.configure({ region: 'us-east-1' });
            const { key } = await Storage.put(`${uuid()}.png`, profilePic, {contentType: 'image/png'});

            const newContact = {
                id: uuid(),
                name,
                carPlateNumber,
                profilePicPath: key
            };

            // Persist new Contact
            await API.graphql(graphqlOperation(createContact, {input: newContact}));
            getContacts()
        } catch(err) {
            console.log('error', err);
        }
    }
    useEffect(() => {
        {
            props.isAuthenticated !== true && (
                navigate('/')
            )
            getContacts()
        }
    }, []);



    return (
        < Container >
            <Button onClick={handleSpotSearch}>Search empty Spot</Button>
             
            <Row className="px-4 my-5">
                <Col><h1>Contacts</h1></Col>
            </Row>
            <Row>
                {
                    contacts.map((contact, indx) => {
                        return (
                            <Col className="px-2 my-2" key={indx}>
                                <Card style={{ width: '12rem' }}>
                                    <Card.Img
                                        src={profilePicPaths[indx]}
                                        variant="top" />
                                    <Card.Body>
                                        <Card.Title>{contact.name}</Card.Title>
                                        <Card.Text>

                                            Car Plate: {contact.carPlateNumber}
                                            {/* {contact.email}
                                            <br />{contact.cell} */}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )
                    })
                }
            </Row>
            <Row className="px-4 my-5">
                <Col sm={3}>
                    <h2>Add New Contact</h2>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicText">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Contact name"
                                value={contactInfo.name}
                                onChange={evt => setContactInfo({ ...contactInfo, name: evt.target.value })} />
                        </Form.Group>
                        {/* <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control type="email" placeholder="Contact email"
                                value={contactInfo.email}
                                onChange={evt => setContactInfo({ ...contactInfo, email: evt.target.value })} />
                        </Form.Group> */}
                        <Form.Group className="mb-3" controlId="formBasicText">
                            <Form.Label>Car Plate Number</Form.Label>
                            <Form.Control type="text" placeholder="nnn-nnn-nnnn"
                                value={contactInfo.carPlateNumber}
                                onChange={evt => setContactInfo({ ...contactInfo, carPlateNumber: evt.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicText">
                            <Form.Label>Profile Pic</Form.Label>
                            <Form.Control type="file" accept="image/png"
                                onChange={evt => setProfilePic(evt.target.files[0])} />
                        </Form.Group>
                        <Button variant="primary" type="button" onClick={addNewContact}>Add Contact &gt;&gt;</Button>&nbsp;
                        {/* <Button variant="primary" type="button" >Add Contact &gt;&gt;</Button>&nbsp; */}
                    </Form>
                </Col>
            </Row>
            

            
            <Form onSubmit={handleSearch}>
                <Form.Group controlId="formPlateNumber">
                    <Form.Label>Plate Number</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter plate number" 
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Search
                </Button>
            </Form> 
             {searchResults.length > 0 && (
                <div>
                    <h3>Search Results:</h3>
                    {searchResults.map(contact => (
                        <p key={contact.id}>
                            Name: {contact.name}, Plate Number: {contact.carPlateNumber}
                            
                        </p>
                    ))}
                </div>
            )} 


            {/* Added */}
            {/* Modal for displaying plate number and zone number */}
            {/* <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Car Plate and Zone Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Car Plate Number: {modalData.plateNumber}</p>
                    <p>Zone Number: {modalData.zoneNum}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal> */}

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title> Car Plate and Zone Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Car Plate Number:</strong> {modalData.plateNumber}</p>
                    <p><strong>Zone Number:</strong> {modalData.zoneNum}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


          {/* Not Found Modal */}
            <Modal show={showNotFoundModal} onHide={handleCloseNotFoundModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Search Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Car plate number not found.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseNotFoundModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>



            <Modal show={showSpotModal} onHide={handleSpotCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title> Empty Spot Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Empty Spot:</strong> {modalSpotData.emptySpot}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSpotCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


          {/* Not Found Modal */}
            <Modal show={showSpotNotFoundModal} onHide={handleSpotCloseNotFoundModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Search Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    No empty spot.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleSpotCloseNotFoundModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>  
        </Container >
    )
}

export default Contacts;



