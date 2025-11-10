import React from 'react'
import { Input, Card, CardBody, Image, Button, Chip } from "@heroui/react"

export const SearchIcon = ({ size = 24, strokeWidth = 1.5, width, height, ...props }) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={height || size}
            role="presentation"
            viewBox="0 0 24 24"
            width={width || size}
            {...props}
        >
            <path
                d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
            />
            <path
                d="M22 22L20 20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
            />
        </svg>
    );
};

const DoctorList = () => {
    const doctors = [
        {
            id: 1,
            name: "Bác sĩ John Doe",
            specialty: "Tim mạch",
            description: "Chuyên khoa về bệnh tim mạch và phẫu thuật tim mạch với hơn 15 năm kinh nghiệm. Được chứng nhận và công nhận quốc tế.",
            image: "/assets/homepage/mockup.jpg",
            priceRange: "500.000 - 1.500.000 VND",
            rating: 4.9,
            experience: "15 năm",
            location: "Đống Đa, Hà Nội, Việt Nam",
        },
        {
            id: 2,
            name: "Bác sĩ Jane Smith",
            specialty: "Nội khoa",
            description: "Chuyên gia trong việc chẩn đoán và điều trị các bệnh nội khoa phổ biến. Hơn 10 năm kinh nghiệm làm việc tại các bệnh viện lớn.",
            image: "/assets/homepage/mockup.jpg",
            priceRange: "300.000 - 1.000.000 VND",
            rating: 4.7,
            experience: "10 năm",
            location: "Hồ Chí Minh, Việt Nam",
        },
        {
            id: 3,
            name: "Bác sĩ Emily Johnson",
            specialty: "Nhi khoa",
            description: "Chuyên khoa nhi với hơn 8 năm kinh nghiệm chăm sóc sức khỏe cho trẻ em từ sơ sinh đến tuổi vị thành niên.",
            image: "/assets/homepage/mockup.jpg",
            priceRange: "400.000 - 1.200.000 VND",
            rating: 4.8,
            experience: "8 năm",
            location: "Cần Thơ, Việt Nam",
        },
    ]

    return (
        <div className="w-full mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-gray-800">Find Your Doctor</h2>
                <p className="text-gray-600 mb-6">Connect with experienced healthcare professionals</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Input
                    classNames={{
                        base: "max-w-full sm:max-w-[40rem] h-15",
                        mainWrapper: "h-full",
                        input: "text-small",
                        inputWrapper:
                            "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                    }}
                    placeholder="Type to search..."
                    size="sm"
                    startContent={<SearchIcon size={18} />}
                    type="search"
                />
                <Button
                    color="primary"
                    variant="solid"
                    size="md"
                    className="ml-0 w-40 h-15"
                    onPress={() => console.log("Search clicked")}
                >
                    Search
                </Button>
                </div>
            </div>

            {/* Doctor Cards - Landscape Layout */}
            <div className="space-y-4">
                {doctors.map((doctor) => (
                    <div key={doctor.id} className="flex flex-col lg:flex-row gap-4">
                        {/* Main Doctor Info Card */}
                        <Card className="flex-1 hover:shadow-xl transition-shadow duration-300 border-0">
                            <CardBody className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Doctor Image */}
                                    <div className="md:w-80 h-48 md:h-auto relative overflow-hidden">
                                        <Image
                                            src={doctor.image}
                                            alt={doctor.name}
                                            className="w-full h-full object-cover"
                                            radius="none"
                                        />
                                    </div>

                                    {/* Doctor Info */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{doctor.name}</h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Chip
                                                            color="primary"
                                                            variant="flat"
                                                            size="sm"
                                                            className="font-medium"
                                                        >
                                                            {doctor.specialty}
                                                        </Chip>
                                                        <span className="text-sm text-gray-500">•</span>
                                                        <span className="text-sm text-gray-600">{doctor.experience} experience</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Chip
                                                        color={doctor.rating >= 4 ? "success" : "warning"}
                                                        variant="flat"
                                                        size="sm"
                                                        startContent="⭐"
                                                        className="font-medium"
                                                    >
                                                        {doctor.rating}
                                                    </Chip>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <p className="text-sm text-gray-500 mb-3">📍 {doctor.location}</p>

                                            {/* Description */}
                                            <p className="text-gray-700 mb-4 leading-relaxed">
                                                {doctor.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Action Card */}
                        <Card className="lg:w-80 hover:shadow-xl transition-shadow duration-300 border-0">
                            <CardBody className="p-6 flex flex-col justify-center">
                                <div className="text-center mb-6">
                                    <span className="text-sm text-gray-500 block mb-1">Chi phí khám</span>
                                    <div className="text-2xl font-bold text-green-600">
                                        {doctor.priceRange}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        color="primary"
                                        variant="solid"
                                        size="lg"
                                        onPress={() => console.log(`Book ${doctor.name}`)}
                                        className="w-full"
                                    >
                                        Đặt lịch hẹn
                                    </Button>
                                    <Button
                                        color="default"
                                        variant="bordered"
                                        size="lg"
                                        onPress={() => console.log(`View details for ${doctor.name}`)}
                                        className="w-full"
                                    >
                                        Xem chi tiết
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DoctorList