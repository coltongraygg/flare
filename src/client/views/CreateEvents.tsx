import React from 'react';
import {useState, useEffect} from 'react';
import axios from 'axios';
import {Textarea} from '../../components/ui/textarea';
import {Input} from '../../components/ui/input';
import {Button} from "../../components/ui/button";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem,} from '../../components/ui/select';
import {Card} from '../../components/ui/card';
import {Separator} from '../../components/ui/seperator';
import { Ripple } from '../../components/ui/ripple'
import {Toggle, toggleVariants} from '../../components/ui/toggle';
import dayjs from 'dayjs';
import VenueSearch from '../components/event-form/VenueSearch';
import DateTime from '../components/event-form/DateTime';
type EventData = {
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    venueDescription: string;
    streetAddress: string;
    zipCode: number | null;
    cityName: string;
    stateName: string;
    interests: string[];
    category: string;
};

function CreateEvents() {
    const [formInfo, setFormInfo] = useState<EventData>({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endTime: '',
        venue: '',
        venueDescription: '',
        streetAddress: '',
        cityName: '',
        stateName: '',
        zipCode: null,
        interests: [],
        category: '',
    });
    const [venues, setVenues] = useState<Array<{
        name: string;
        description: string;
        street_address: string;
        zip_code: number;
        city_name: string;
        state_name: string;
    }>>([]);
    // const [date, setDate] = React.useState<Date>()
    const [categories, setCategories] = useState([]); // Categories from DB
    const [interests, setInterests] = useState([]); // Interests from DB
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]); // User selected Interests
    // const [isNewVenue, setIsNewVenue] = useState(false);
    const [venueSearch, setVenueSearch] = useState('');
    const [filteredVenues, setFilteredVenues] = useState([]);
    const [step, setStep] = useState(1);
    const [isLoadingVenue, setIsLoadingVenue] = useState(false);
    const [geoLocation, setGeoLocation] = useState();


    // temp geolocation call to see if this fixes bug
    const getUserLoc = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setGeoLocation({ latitude, longitude });
            })
        } else {
            console.error('Geolocation not allowed');
        }
    }






    const handleVenueSelect = async (venue) => {
        try {
            setFormInfo(prev => ({
                ...prev,
                venue: venue.name,
                venueDescription: venue.description || '',
                streetAddress: venue.street_address,
                zipCode: venue.zip_code,
                cityName: venue.city_name,
                stateName: venue.state_name,
                fsq_id: venue.fsq_id
            }));
            setStep(5);
        } catch (error) {
            console.error('Error updating form with venue:', error);
        }
    };

    // navigation handling
    function handlePrev() {
        if (step > 1) setStep((step) => step - 1);
        console.log('um, ', geoLocation);
        console.log('hello', localStorage.userLocation);
    }
    function handleNext() {
        if (step < 5) setStep((step) => step + 1);
    }


    // handling toggle selection for interests
    const toggleInterest = (interest: string) => {
        // filter through interests to see which one is checked
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );

        // update form data with mew interests
        setFormInfo(prev => ({
            ...prev,
            interests: formInfo.interests.includes(interest)
                ? formInfo.interests.filter(i => i !== interest)
                : [...formInfo.interests, interest]
        }));
    };

    // handle category selection
    const selectCategory = (value: string) => {
        // update form info
        setFormInfo(prev => ({
            ...prev, category: value
        }));
    }


    // generic handle change for zip code
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormInfo((prevState) => ({
            ...prevState,
            [name]: name === 'zipCode' ? Number(value) : value,
        }));
    };


    // form submission handling
    const onSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const formattedData = {
                title: formInfo.title,
                description: formInfo.description,
                category: formInfo.category,
                interests: formInfo.interests,
                startDate: formInfo.startDate,
                startTime: formInfo.startTime,
                endTime: formInfo.endTime,
                venue: formInfo.venue,
                venueDescription: formInfo.venueDescription,
                streetAddress: formInfo.streetAddress,
                zipCode: Number(formInfo.zipCode),
                cityName: formInfo.cityName,
                stateName: formInfo.stateName.toUpperCase(),
            };
            await axios.post('/api/event', formattedData);
            setStep(1);
            setFormInfo('');
        } catch (error) {
            console.error('Error creating event:', error.response?.data || error);
        }
    };



    // get interests from db
    const getInterests = async () => {
        try {
            const allInterests = await axios.get('/api/signup/interests');
            setInterests(allInterests.data);
        } catch (error) {
            console.error('Error getting interests from DB', error);
        }
    };


    // get categories from db
    const getCategories = async () => {
        try {
            const allCategories = await axios.get('/api/event/categories');
            setCategories(allCategories.data);
        } catch (error) {
            console.error('Error getting categories from DB', error);
        }
    };


    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        getInterests();
        // noinspection JSIgnoredPromiseFromCall
        getCategories();
        // noinspection JSIgnoredPromiseFromCall
        getUserLoc();
    },[]);


    return (
        <div className='min-h-screen bg-gradient-to-br from-black via-gray-900 to-pink-900 relative overflow-hidden pt-20'>
        <div
            className='min-h-screen pt-20 flex items-center justify-center'>
            <Card className='p-5 w-[550px] mx-auto bg-blue-500 p-4 px-8 rounded-lg'>


                {/* BEGINNING OF FORM */}


                {step === 1 && (
                    <div>
                        <div className='mb-5 text-2xl font-semibold'>
                            Your next favorite memory starts with this moment.
                        </div>
                        <Separator
                            className='my-5 bg-color-5'>
                        </Separator>
                        <Input
                            className='bg-color-0 mb-5'
                            name="title"
                            placeholder="Event Title"
                            value={formInfo.title}
                            onChange={handleChange}
                        />
                        <Textarea
                            className='bg-color-10 mb-5'
                            name="description"
                            placeholder="Description"
                            value={formInfo.description}
                            onChange={handleChange}
                        />
                        <div
                            className='mb-5 font-semibold text-center'>
                            Remember, everyone here started exactly where you are.
                        </div>
                    </div>
                )}


                {/* CATEGORY AND INTERESTS SELECTION */}


                {step === 2 && (
                    <div>
                        <div className='mb-5 text-2xl font-semibold'>
                            Connect through what you love most
                        </div>
                        <Separator
                            className='my-5 bg-color-5'>
                        </Separator>
                        <Select
                            value={formInfo.category}
                            onValueChange={selectCategory}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select A Category"/>
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                        {/* MAP OVER INTERESTS */}


                        <div className="my-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {interests.map((interest, index) => (
                                <Toggle
                                    key={index}
                                    pressed={selectedInterests.includes(interest)}
                                    onPressedChange={() => toggleInterest(interest)}
                                    variant="outline"
                                    size="lg"
                                    className='h-12 w-26'
                                >
                                    {interest}
                                </Toggle>
                            ))}
                        </div>
                        <div
                            className='my-5 font-semibold text-center'>
                            Where shared interests become shared moments
                        </div>
                    </div>
                )}


                {/* TIME AND DATE INFORMATION */}


                {step === 3 && (
                    <DateTime
                        formInfo={formInfo}
                        handleChange={handleChange}
                    />
                )}


                {/* VENUE SELECTION */}



                {step === 4 && (
                    <div>
                        <VenueSearch
                            handleVenueSelect={handleVenueSelect}
                        />
                        <div className='mt-10'>
                            <Separator />
                        </div>
                    </div>
                )}


                {/* CONFIRM DETAILS */}


                {step === 5 && (
                    <div className="mb-5 space-y-6">
                        <h2 className="text-2xl font-semibold">Confirm Your Event Details</h2>
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Event Information</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-gray-600">Title:</p>
                                    <p>{formInfo.title}</p>
                                    <p className="text-gray-600">Description:</p>
                                    <p>{formInfo.description}</p>
                                    <p className="text-gray-600">Category:</p>
                                    <p>{formInfo.category}</p>
                                    <p className="text-gray-600">Interests:</p>
                                    <p>{formInfo.interests.join(', ')}</p>
                                    <p className="text-gray-600">Start Date:</p>
                                    <p>{dayjs(formInfo.startDate).format("MMM D, YYYY")}</p>
                                    <p className="text-gray-600">Start Time:</p>
                                    <p>{dayjs(`2024-01-01T${formInfo.startTime}`).format("h:mm A")}</p>
                                    <p className="text-gray-600">End Time:</p>
                                    <p>{dayjs(`2024-01-01T${formInfo.endTime}`).format("h:mm A")}</p>
                                </div>
                            </div>
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Venue Information</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-gray-600">Venue Name:</p>
                                    <p>{formInfo.venue}</p>
                                    <>
                                        <p className="text-gray-600">Description:</p>
                                        <p>{formInfo.venueDescription}</p>
                                        <p className="text-gray-600">Address:</p>
                                        <p>{formInfo.streetAddress}</p>
                                        <p className="text-gray-600">City:</p>
                                        <p>{formInfo.cityName}</p>
                                        <p className="text-gray-600">State:</p>
                                        <p>{formInfo.stateName}</p>
                                        <p className="text-gray-600">Zip Code:</p>
                                        <p>{formInfo.zipCode}</p>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* BUTTONS BUTTONS BUTTONS AND BUTTONS! */}


                <div className='flex flex-col justify-center items-center gap-4 '>


                {step === 5 ? (
                    <Button
                        onClick={onSubmit}
                        className='bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 rounded-xl'
                    >
                        <span className='text-lg font-medium text-black !normal-case'>
                            Submit Event
                        </span>
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        className='bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 rounded-xl'
                    >
                        <span className='text-lg font-medium text-black !normal-case'>
                            {step === 4 ? "Review" : "Continue"}
                        </span>
                    </Button>
                )}
                <Button
                    onClick={handlePrev}
                    disabled={step === 1}
                    className='bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 rounded-xl'>
                    <span className='text-lg font-medium text-black !normal-case'>
                        Go Back
                    </span>
                </Button>
                </div>
            </Card>
        </div>
        </div>
    )}

export default CreateEvents;
